import type { ChangeEvent } from 'react'
import styled from 'styled-components'

type ThemeToggleSwitchProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  ariaLabel?: string
}

export function ThemeToggleSwitch({
  checked,
  onChange,
  disabled = false,
  ariaLabel = 'Toggle theme',
}: ThemeToggleSwitchProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.checked)
  }

  return (
    <StyledWrapper>
      <label className="switch">
        <input
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          aria-label={ariaLabel}
        />
        <span className="slider" />
      </label>
    </StyledWrapper>
  )
}

const StyledWrapper = styled.div`
  .switch {
    font-size: 17px;
    position: relative;
    display: inline-block;
    width: 3.5em;
    height: 2em;
  }

  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #bfdbc9;
    box-shadow: inset 2px 5px 10px rgba(0, 0, 0, 0.3);
    transition: 0.4s;
    border-radius: 5px;
  }

  .slider:before {
    position: absolute;
    content: '';
    height: 1.4em;
    width: 0.1em;
    border-radius: 0px;
    left: 0.3em;
    bottom: 0.3em;
    background-color: white;
    transition: 0.4s;
  }

  input:checked + .slider {
    background-color: #dbbfc4;
    box-shadow: inset 2px 5px 10px rgb(0, 0, 0, 0.3);
  }

  input:checked + .slider:before {
    transform: translateX(2.8em) rotate(360deg);
  }

  input:disabled + .slider {
    cursor: not-allowed;
    opacity: 0.6;
  }
`
