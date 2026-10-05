import { useState, type FormEvent } from 'react';
import { Wordmark } from '../components/Brand';
import { MAX_NAME_LENGTH, validateNames } from '../game/rules';
import type { PlayerIndex } from '../types/game';
import { href } from '../utils/router';
import './setup.css';

type FirstChoice = 'coin' | PlayerIndex;

interface Props {
  onStart: (names: [string, string], first?: PlayerIndex) => void;
}

export function SetupPage({ onStart }: Props) {
  const [names, setNames] = useState<[string, string]>(['', '']);
  const [first, setFirst] = useState<FirstChoice>('coin');
  const [error, setError] = useState<string | null>(null);

  function setName(i: PlayerIndex, value: string) {
    const next: [string, string] = [...names];
    next[i] = value;
    setNames(next);
    if (error) setError(null);
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    const problem = validateNames(names[0], names[1]);
    if (problem) {
      setError(problem);
      return;
    }
    onStart(names, first === 'coin' ? undefined : first);
  }

  const label = (i: PlayerIndex) => names[i].trim() || `Player ${i + 1}`;

  return (
    <main className="setup" id="main">
      <div className="setup__pattern" aria-hidden>
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i}>Mischief Mischief Mischief Mischief Mischief</span>
        ))}
      </div>

      <a href={href('/')} className="setup__home" aria-label="Back to home">
        <Wordmark />
      </a>

      <form className="setup__form" onSubmit={submit} noValidate>
        <p className="eyebrow setup__eyebrow">Game setup</p>
        <h1 className="setup__title">Who’s causing the problems tonight?</h1>

        <div className="setup__tags">
          {([0, 1] as PlayerIndex[]).map((i) => (
            <label key={i} className={`name-tag name-tag--${i}`}>
              <span className="name-tag__role">
                Player {i + 1} · {i === 0 ? 'The Instigator' : 'The Accomplice'}
              </span>
              <span className="name-tag__hello">Hello, my name is</span>
              <input
                className="name-tag__input"
                value={names[i]}
                onChange={(e) => setName(i, e.target.value)}
                maxLength={MAX_NAME_LENGTH}
                placeholder={i === 0 ? 'Liam' : 'Emma'}
                autoComplete="off"
                autoCapitalize="words"
                spellCheck={false}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'setup-error' : undefined}
                autoFocus={i === 0}
              />
            </label>
          ))}
        </div>

        <fieldset className="setup__first">
          <legend className="eyebrow">Who draws first?</legend>
          <div className="segmented">
            {(['coin', 0, 1] as FirstChoice[]).map((opt) => (
              <label key={String(opt)} className={first === opt ? 'is-on' : ''}>
                <input
                  type="radio"
                  name="first"
                  checked={first === opt}
                  onChange={() => setFirst(opt)}
                  className="visually-hidden"
                />
                {opt === 'coin' ? 'Flip a coin' : label(opt)}
              </label>
            ))}
          </div>
        </fieldset>

        {error && (
          <p className="setup__error" id="setup-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="btn btn--big setup__go">
          Let’s cause problems <span aria-hidden>→</span>
        </button>

        <ul className="setup__recap">
          <li>
            <strong>21</strong> credits wins
          </li>
          <li>
            <strong>−1</strong> to skip a card
          </li>
          <li>
            <strong>👀</strong> teal cards are secret
          </li>
        </ul>
      </form>
    </main>
  );
}
