import { useEffect, useMemo, useState } from 'react';
import { Wordmark } from '../components/Brand';
import { CategoryIcon } from '../components/CategoryIcon';
import { CardBack, CardFace } from '../components/GameCard';
import { DECK } from '../data/cards';
import { CATEGORIES } from '../data/categories';
import {
  EMPTY_LAB,
  TIMER_OPTIONS,
  addCard,
  applyLab,
  blankCard,
  countChanges,
  decodeLab,
  encodeLab,
  mechanicFor,
  nextNumber,
  normalizeCard,
  proposalLab,
  removeCard,
  restoreCard,
  revertCard,
  sanitizeLab,
  saveEdit,
  type LabCard,
  type LabState,
} from '../lab/lab';
import type { Card, CardTone, CategoryId } from '../types/game';
import { href } from '../utils/router';
import './lab.css';

const STORAGE_KEY = 'cm-card-lab-v1';

const COLOURS: { tone: CardTone; name: string; vibe: string; cats: CategoryId[] }[] = [
  { tone: 'dark', name: 'Black cards', vibe: 'Do something', cats: ['action', 'performance', 'challenge'] },
  { tone: 'light', name: 'White cards', vibe: 'Talk', cats: ['connection'] },
  { tone: 'teal', name: 'Teal cards', vibe: 'A secret twist', cats: ['side-quest', 'mischief', 'chaos'] },
];

const STATUS_LABEL: Record<LabCard['status'], string> = { same: '', edited: 'Edited', new: 'New', removed: 'Removed' };

function backFor(tone: CardTone) {
  if (tone === 'teal') return <CardBack variant="secret" label="👀 For your eyes only" />;
  return <CardBack variant={tone === 'light' ? 'light' : 'standard'} />;
}

function loadLocal(): LabState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? sanitizeLab(JSON.parse(raw)) : EMPTY_LAB;
  } catch {
    return EMPTY_LAB;
  }
}

function saveLocal(lab: LabState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lab));
  } catch {
    /* storage blocked: the lab still works for this visit */
  }
}

/** A card you can click to flip between front and back. Only the visible side is rendered, to keep 150 cards light. */
function FlipTile({ card, showBack }: { card: Card; showBack: boolean }) {
  const [flipped, setFlipped] = useState(false);
  const [turning, setTurning] = useState(false);
  useEffect(() => setFlipped(false), [showBack]);
  const down = showBack !== flipped;
  const tone = CATEGORIES[card.category].tone;
  function flip() {
    if (turning) return;
    setTurning(true);
    window.setTimeout(() => setFlipped((f) => !f), 140);
    window.setTimeout(() => setTurning(false), 280);
  }
  return (
    <div className={`lab-tile__flip card-frame ${turning ? 'is-turning' : ''}`}>
      {down ? backFor(tone) : <CardFace card={card} />}
      <button
        type="button"
        className="lab-tile__hit"
        onClick={flip}
        aria-label={`${card.title || 'Untitled card'}: showing the ${down ? 'back' : 'front'}. Flip it.`}
      />
    </div>
  );
}

interface EditorProps {
  draft: Card;
  isNew: boolean;
  original?: Card;
  onChange: (card: Card) => void;
  onSave: () => void;
  onCancel: () => void;
}

function Editor({ draft, isNew, original, onChange, onSave, onCancel }: EditorProps) {
  const set = (patch: Partial<Card>) => onChange(normalizeCard({ ...draft, ...patch }));
  const cat = CATEGORIES[draft.category];
  const pill = draft.chaosEffect?.type === 'house-rule' ? draft.chaosEffect.label : '';
  const canSave = draft.title.trim().length > 0 && draft.description.trim().length > 0;
  return (
    <div className="lab-editor" role="dialog" aria-modal="true" aria-label={isNew ? 'New card' : `Edit ${draft.title}`}>
      <div className="lab-editor__panel">
        <div className="lab-editor__form">
          <h2>{isNew ? 'New card' : 'Edit card'}</h2>
          <label>
            <span>Type of card</span>
            <select
              value={draft.category}
              onChange={(e) => {
                const category = e.target.value as CategoryId;
                set({ category, mechanic: mechanicFor(category), chaosEffect: category === 'chaos' ? draft.chaosEffect : undefined });
              }}
            >
              {COLOURS.map((col) => (
                <optgroup key={col.tone} label={col.name}>
                  {col.cats.map((id) => (
                    <option key={id} value={id}>
                      {CATEGORIES[id].name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <small>{cat.tagline}</small>
          </label>
          <label>
            <span>Title</span>
            <input value={draft.title} maxLength={60} onChange={(e) => onChange({ ...draft, title: e.target.value })} />
          </label>
          <label>
            <span>What the card says</span>
            <textarea
              rows={4}
              value={draft.description}
              maxLength={400}
              onChange={(e) => onChange({ ...draft, description: e.target.value })}
            />
          </label>
          <label>
            <span>Extra line (optional)</span>
            <input
              value={draft.specialRule ?? ''}
              maxLength={160}
              placeholder="How you win, what counts, a cheeky note"
              onChange={(e) => onChange({ ...draft, specialRule: e.target.value })}
            />
          </label>
          {draft.category === 'chaos' ? (
            <label>
              <span>What the chaos does</span>
              <input
                value={pill || ''}
                maxLength={40}
                placeholder={original?.chaosEffect && original.chaosEffect.type !== 'house-rule' ? 'Keeps its current effect' : 'e.g. STEAL 2 CREDITS'}
                onChange={(e) =>
                  onChange({
                    ...draft,
                    chaosEffect: e.target.value
                      ? { type: 'house-rule', label: e.target.value.toUpperCase() }
                      : original?.chaosEffect ?? { type: 'house-rule', label: 'NEW HOUSE RULE' },
                  })
                }
              />
              <small>Shown on the pill at the bottom of the card.</small>
            </label>
          ) : (
            <fieldset>
              <legend>Chaos Credits</legend>
              <div className="lab-seg">
                {[1, 2, 3].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={draft.creditValue === n ? 'is-on' : ''}
                    aria-pressed={draft.creditValue === n}
                    onClick={() => set({ creditValue: n })}
                  >
                    {n} <small>{n === 1 ? 'quick' : n === 2 ? 'takes a bit' : 'big one'}</small>
                  </button>
                ))}
              </div>
            </fieldset>
          )}
          {draft.category === 'connection' && (
            <label className="lab-check">
              <input
                type="checkbox"
                checked={draft.mechanic === 'shared'}
                onChange={(e) => onChange(normalizeCard({ ...draft, mechanic: e.target.checked ? 'shared' : 'standard' }))}
              />
              <span>Both of you answer and both earn (EACH)</span>
            </label>
          )}
          <label>
            <span>Timer (optional)</span>
            <select value={draft.timerSeconds ?? 0} onChange={(e) => set({ timerSeconds: Number(e.target.value) })}>
              {[...new Set([...TIMER_OPTIONS, draft.timerSeconds ?? 0])].sort((x, y) => x - y).map((s) => (
                <option key={s} value={s}>
                  {s === 0 ? 'No timer' : s % 60 === 0 ? `${s / 60} min` : `${s} sec`}
                </option>
              ))}
            </select>
          </label>
          <div className="lab-editor__actions">
            <button type="button" className="btn" disabled={!canSave} onClick={onSave}>
              {isNew ? 'Add card' : 'Save changes'}
            </button>
            <button type="button" className="btn btn--ghost" onClick={onCancel}>
              Cancel
            </button>
          </div>
          {!canSave && <p className="lab-editor__hint">Give it a title and some card text to save it.</p>}
        </div>
        <div className="lab-editor__preview" aria-label="Preview">
          <p className="eyebrow">Preview</p>
          <div className="lab-editor__cards">
            <div className="card-frame">
              <CardFace card={draft} />
            </div>
            <div className="card-frame">{backFor(cat.tone)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

const PRINT_ORDER: CategoryId[] = ['action', 'performance', 'challenge', 'connection', 'side-quest', 'mischief', 'chaos'];

/** Letter pages, 9 cards each, in deck order, then a page of the three backs. Printed via the browser's "Save as PDF". */
function PrintSheets({ cards }: { cards: Card[] }) {
  const sorted = [...cards].sort(
    (a, b) => PRINT_ORDER.indexOf(a.category) - PRINT_ORDER.indexOf(b.category) || a.number - b.number,
  );
  const pages: Card[][] = [];
  for (let i = 0; i < sorted.length; i += 9) pages.push(sorted.slice(i, i + 9));
  return (
    <div className="lab-print" aria-hidden>
      {pages.map((page, i) => (
        <section key={i} className="lab-print__page">
          {page.map((card) => (
            <div key={card.id} className="lab-print__card card-frame">
              <CardFace card={card} />
            </div>
          ))}
        </section>
      ))}
      <section className="lab-print__page">
        {(['dark', 'light', 'teal'] as CardTone[]).map((tone) => (
          <div key={tone} className="lab-print__card card-frame">
            {backFor(tone)}
          </div>
        ))}
      </section>
    </div>
  );
}

export function LabPage({ params }: { params: URLSearchParams }) {
  const [lab, setLab] = useState<LabState>(loadLocal);
  const [incoming, setIncoming] = useState<LabState | null>(null);
  const [linkError, setLinkError] = useState(false);
  const [showBacks, setShowBacks] = useState(false);
  const [onlyChanged, setOnlyChanged] = useState(false);
  const [editing, setEditing] = useState<{ draft: Card; isNew: boolean; original?: Card } | null>(null);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [printing, setPrinting] = useState(false);

  useEffect(() => saveLocal(lab), [lab]);

  // "Download deck as PDF": render the print sheets, open the print dialog, then tidy up.
  useEffect(() => {
    if (!printing) return;
    const done = () => setPrinting(false);
    window.addEventListener('afterprint', done);
    const t = window.setTimeout(() => window.print(), 300);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('afterprint', done);
    };
  }, [printing]);

  useEffect(() => {
    if (!editing) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setEditing(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editing]);

  // A share link carries a change set in ?d=
  const code = params.get('d');
  useEffect(() => {
    if (!code) return;
    decodeLab(code)
      .then((s) => setIncoming(s))
      .catch(() => setLinkError(true));
  }, [code]);

  const cards = useMemo(() => applyLab(DECK, lab), [lab]);
  const counts = useMemo(() => countChanges(lab, DECK), [lab]);
  const totalChanges = counts.edited + counts.added + counts.removed;
  const inDeck = cards.filter((c) => c.status !== 'removed');

  function clearLinkFromAddress() {
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#/lab`);
  }

  async function share() {
    const url = `${window.location.origin}${window.location.pathname}#/lab?d=${await encodeLab(lab)}`;
    setShareUrl(url);
    setCopied(false);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      /* the link is shown below to copy by hand */
    }
  }

  function download() {
    const blob = new Blob([JSON.stringify({ changes: lab, deck: inDeck.map((c) => c.card) }, null, 2)], {
      type: 'application/json',
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `chaotic-mischief-card-changes-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function startNew(category: CategoryId = 'connection') {
    setEditing({ draft: blankCard(category, nextNumber(DECK, lab)), isNew: true });
  }

  function saveEditor() {
    if (!editing) return;
    setLab((prev) => (editing.isNew ? addCard(prev, editing.draft) : saveEdit(prev, DECK, editing.draft)));
    setEditing(null);
  }

  return (
    <div className="lab">
      <header className="lab-head">
        <a href={href('/')} className="lab-head__home" aria-label="Chaotic Mischief home">
          <Wordmark />
        </a>
        <span className="lab-head__tag">Card Lab</span>
      </header>

      <main id="main" className="lab-main">
        <section className="lab-intro">
          <p className="eyebrow">Card Lab · not the live deck</p>
          <h1>Every card, ready to play with.</h1>
          <p>
            Edit any card, add new ones, or take cards out. Click a card to flip it. Nothing here changes the real game:
            your changes stay on this device until you send them with <strong>Share my changes</strong>.
          </p>
        </section>

        {incoming && (
          <div className="lab-banner" role="status">
            <p>
              <strong>Someone shared card changes with you.</strong> {countChanges(incoming, DECK).edited} edited,{' '}
              {incoming.added.length} new, {countChanges(incoming, DECK).removed} removed.
            </p>
            <div className="lab-banner__btns">
              <button type="button" className="btn" onClick={() => { setLab(incoming); setIncoming(null); clearLinkFromAddress(); }}>
                Open their changes
              </button>
              <button type="button" className="btn btn--ghost" onClick={() => { setIncoming(null); clearLinkFromAddress(); }}>
                Keep mine
              </button>
            </div>
            {totalChanges > 0 && <p className="lab-banner__note">Opening theirs replaces the changes saved on this device.</p>}
          </div>
        )}
        {linkError && (
          <div className="lab-banner lab-banner--error" role="alert">
            <p>That share link didn’t open. It may have been cut off when it was copied. Ask for the link again.</p>
          </div>
        )}

        <div className="lab-bar">
          <div className="lab-bar__counts" aria-live="polite">
            <b>{inDeck.length}</b> cards in the deck
            {totalChanges > 0 && (
              <span>
                {' '}· {counts.edited} edited · {counts.added} new · {counts.removed} removed
              </span>
            )}
          </div>
          <div className="lab-bar__btns">
            <button type="button" className="btn" onClick={() => startNew()}>
              + New card
            </button>
            <button type="button" className="btn btn--ghost" aria-pressed={showBacks} onClick={() => setShowBacks((b) => !b)}>
              {showBacks ? 'Show all fronts' : 'Flip all to backs'}
            </button>
            <button type="button" className="btn btn--ghost" aria-pressed={onlyChanged} onClick={() => setOnlyChanged((o) => !o)}>
              {onlyChanged ? 'Show every card' : 'Only my changes'}
            </button>
            <button type="button" className="btn btn--ghost" onClick={share} disabled={totalChanges === 0}>
              Share my changes
            </button>
          </div>
          <div className="lab-bar__more">
            <button type="button" className="lab-link" onClick={() => setLab(proposalLab(DECK))}>
              Load the Nov rules proposal
            </button>
            <button type="button" className="lab-link" onClick={() => setPrinting(true)}>
              Download the deck as a PDF
            </button>
            <button type="button" className="lab-link" onClick={download} disabled={totalChanges === 0}>
              Download changes
            </button>
            {confirmReset ? (
              <span className="lab-confirm">
                Clear every change on this device?{' '}
                <button type="button" className="lab-link" onClick={() => { setLab(EMPTY_LAB); setConfirmReset(false); }}>
                  Yes, start over
                </button>{' '}
                <button type="button" className="lab-link" onClick={() => setConfirmReset(false)}>
                  No
                </button>
              </span>
            ) : (
              <button type="button" className="lab-link" onClick={() => setConfirmReset(true)} disabled={totalChanges === 0}>
                Start over
              </button>
            )}
          </div>
          {shareUrl && (
            <div className="lab-share">
              <p>{copied ? 'Link copied. Send it to anyone: opening it shows them your changes.' : 'Copy this link and send it:'}</p>
              <input readOnly value={shareUrl} onFocus={(e) => e.currentTarget.select()} aria-label="Share link" />
            </div>
          )}
        </div>

        {COLOURS.map((col) => {
          const colourCards = cards.filter((c) => col.cats.includes(c.card.category));
          return (
            <section key={col.tone} className={`lab-colour lab-colour--${col.tone}`}>
              <div className="lab-colour__head">
                <div className="lab-colour__back card-frame">{backFor(col.tone)}</div>
                <div>
                  <h2>{col.name}</h2>
                  <p>
                    {col.vibe} · {colourCards.filter((c) => c.status !== 'removed').length} cards
                  </p>
                </div>
              </div>
              {col.cats.map((cat) => {
                const list = colourCards
                  .filter((c) => c.card.category === cat)
                  .filter((c) => !onlyChanged || c.status !== 'same');
                if (onlyChanged && list.length === 0) return null;
                return (
                  <div key={cat} className="lab-cat">
                    <div className="lab-cat__head">
                      <h3>
                        <CategoryIcon category={cat} size={18} /> {CATEGORIES[cat].name}{' '}
                        <small>{list.filter((c) => c.status !== 'removed').length}</small>
                      </h3>
                      <p>{CATEGORIES[cat].blurb}</p>
                      <button type="button" className="lab-link" onClick={() => startNew(cat)}>
                        + Add {CATEGORIES[cat].name === 'Action' ? 'an' : 'a'} {CATEGORIES[cat].name} card
                      </button>
                    </div>
                    <ul className="lab-grid">
                      {list.map(({ card, status, original }) => (
                        <li key={card.id} className={`lab-tile lab-tile--${status}`}>
                          <FlipTile card={card} showBack={showBacks} />
                          <div className="lab-tile__meta">
                            {status !== 'same' && <span className={`lab-badge lab-badge--${status}`}>{STATUS_LABEL[status]}</span>}
                            <div className="lab-tile__btns">
                              {status === 'removed' ? (
                                <button type="button" className="lab-link" onClick={() => setLab((l) => restoreCard(l, card.id))}>
                                  Put back
                                </button>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    className="lab-link"
                                    onClick={() => setEditing({ draft: card, isNew: false, original })}
                                  >
                                    Edit
                                  </button>
                                  {status === 'edited' && (
                                    <button type="button" className="lab-link" onClick={() => setLab((l) => revertCard(l, card.id))}>
                                      Undo edit
                                    </button>
                                  )}
                                  <button type="button" className="lab-link lab-link--danger" onClick={() => setLab((l) => removeCard(l, card.id))}>
                                    {status === 'new' ? 'Delete' : 'Remove'}
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </li>
                      ))}
                      <li className="lab-tile lab-tile--add">
                        <button type="button" className="lab-add" onClick={() => startNew(cat)}>
                          <span className="lab-add__plus" aria-hidden>
                            <svg viewBox="0 0 24 24" width="22" height="22">
                              <path d="M12 4v16M4 12h16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                            </svg>
                          </span>
                          <span>Add {CATEGORIES[cat].name === 'Action' ? 'an' : 'a'} {CATEGORIES[cat].name} card</span>
                        </button>
                      </li>
                    </ul>
                  </div>
                );
              })}
            </section>
          );
        })}
        <p className="lab-foot">
          Removed cards stay listed (faded) so they can go back in. The real game uses the {DECK.length} cards in the live deck
          until we copy approved changes over.
        </p>
      </main>

      {printing && <PrintSheets cards={inDeck.map((c) => c.card)} />}

      {editing && (
        <Editor
          draft={editing.draft}
          isNew={editing.isNew}
          original={editing.original}
          onChange={(draft) => setEditing({ ...editing, draft })}
          onSave={saveEditor}
          onCancel={() => setEditing(null)}
        />
      )}
    </div>
  );
}
