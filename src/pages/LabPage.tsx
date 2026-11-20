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

/** What changed on an edited card, in a few words. */
function describeEdit(card: Card, original?: Card): string {
  if (!original) return '';
  const parts: string[] = [];
  if (card.category !== original.category) parts.push(`type: ${CATEGORIES[original.category].name} → ${CATEGORIES[card.category].name}`);
  if (card.creditValue !== original.creditValue) parts.push(`credits ${original.creditValue} → ${card.creditValue}`);
  if (card.title !== original.title) parts.push('title');
  if (card.description !== original.description) parts.push('card text');
  if ((card.specialRule ?? '') !== (original.specialRule ?? '')) parts.push('extra line');
  if ((card.timerSeconds ?? 0) !== (original.timerSeconds ?? 0)) parts.push('timer');
  if (card.mechanic !== original.mechanic) parts.push(card.mechanic === 'shared' ? 'now EACH' : 'no longer EACH');
  if (JSON.stringify(card.chaosEffect ?? null) !== JSON.stringify(original.chaosEffect ?? null)) parts.push('chaos effect');
  return parts.length ? `Changed: ${parts.join(', ')}` : '';
}

export function LabPage({ params }: { params: URLSearchParams }) {
  const [lab, setLab] = useState<LabState>(loadLocal);
  const [incoming, setIncoming] = useState<LabState | null>(null);
  const [linkError, setLinkError] = useState(false);
  const [showBacks, setShowBacks] = useState(false);
  const [view, setView] = useState<'all' | 'changes' | 'new'>('all');
  const [editing, setEditing] = useState<{ draft: Card; isNew: boolean; original?: Card } | null>(null);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => saveLocal(lab), [lab]);

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

  const shareSummary = `${counts.edited} edited, ${counts.added} new, ${counts.removed} removed`;

  /** One step: build the link and open an email with it. The sender only adds the address. */
  async function emailChanges() {
    const url = `${window.location.origin}${window.location.pathname}#/lab?d=${await encodeLab(lab)}`;
    setShareUrl(url);
    setCopied(false);
    const subject = 'My Chaotic Mischief card changes';
    const body = `Here are my card changes (${shareSummary}). Open this link to see them in the Card Lab:\n\n${url}\n`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
    } catch {
      setCopied(false);
    }
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
          <p>Edit any card, add new ones, or take cards out. Click a card to flip it. Nothing here changes the real game.</p>
          <ol className="lab-steps">
            <li>
              <b>Add or change cards.</b> Use the dashed “Add a card” box at the end of any row, or Edit on any card.
            </li>
            <li>
              <b>Tap “Email my changes”</b> when you’re done. Your email opens with everything ready.
            </li>
            <li>
              <b>Add the email address of whoever sent you this link, and send.</b> Your changes only live on this device
              until you do.
            </li>
          </ol>
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
          {totalChanges > 0 && !shareUrl && (
            <p className="lab-nudge">
              You have {totalChanges} unsent {totalChanges === 1 ? 'change' : 'changes'}. When you’re done, tap{' '}
              <b>Email my changes</b> so they don’t get lost.
            </p>
          )}
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
            <button type="button" className={totalChanges > 0 ? 'btn' : 'btn btn--ghost'} onClick={emailChanges} disabled={totalChanges === 0}>
              Email my changes
            </button>
            <button type="button" className="btn btn--ghost" aria-pressed={showBacks} onClick={() => setShowBacks((b) => !b)}>
              {showBacks ? 'Show all fronts' : 'Flip all to backs'}
            </button>
          </div>
          <div className="lab-filter" role="group" aria-label="Show">
            <span>Show:</span>
            {([
              ['all', 'All cards'],
              ['changes', `All changes (${totalChanges})`],
              ['new', `New cards (${counts.added})`],
            ] as const).map(([id, label]) => (
              <button key={id} type="button" className={view === id ? 'is-on' : ''} aria-pressed={view === id} onClick={() => setView(id)}>
                {label}
              </button>
            ))}
          </div>
          <div className="lab-bar__more">
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
            <div className="lab-share" role="region" aria-label="Email your changes">
              <div className="lab-share__top">
                <h2>Your email should be open</h2>
                <button type="button" className="lab-link" onClick={() => setShareUrl('')}>
                  Close
                </button>
              </div>
              <p>The email already has the link with your changes ({shareSummary}). Just add the address and send.</p>
              <p className="lab-share__note">
                Email didn’t open?{' '}
                <button type="button" className="lab-link" onClick={copyLink}>
                  {copied ? 'Link copied' : 'Copy the link'}
                </button>{' '}
                and paste it into a message instead. Made more changes later? Send a new one.
              </p>
            </div>
          )}
        </div>

        {view !== 'all' && cards.every((c) => (view === 'new' ? c.status !== 'new' : c.status === 'same')) && (
          <p className="lab-empty">{view === 'new' ? 'No new cards yet.' : 'No changes yet.'} Edit or add a card and it shows up here.</p>
        )}

        {COLOURS.map((col) => {
          const colourCards = cards.filter((c) => col.cats.includes(c.card.category));
          const shown = (c: LabCard) => view === 'all' || (view === 'new' ? c.status === 'new' : c.status !== 'same');
          if (view !== 'all' && !colourCards.some(shown)) return null;
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
                  .filter(shown);
                if (view !== 'all' && list.length === 0) return null;
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
                            {status === 'edited' && describeEdit(card, original) && (
                              <p className="lab-tile__what">{describeEdit(card, original)}</p>
                            )}
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
                      {view === 'all' && (
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
                      )}
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
