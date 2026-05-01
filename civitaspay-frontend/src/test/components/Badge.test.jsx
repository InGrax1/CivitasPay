import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Badge from '../../components/ui/Badge';

describe('Badge', () => {
  it('renderiza estado ACTIVA', () => {
    render(<Badge estado="ACTIVA" />);
    expect(screen.getByText(/activa/i)).toBeInTheDocument();
  });

  it('renderiza estado PAUSADA', () => {
    render(<Badge estado="PAUSADA" />);
    expect(screen.getByText(/pausada/i)).toBeInTheDocument();
  });

  it('renderiza estado TERMINADA', () => {
    render(<Badge estado="TERMINADA" />);
    expect(screen.getByText(/terminada/i)).toBeInTheDocument();
  });

  it('renderiza estado BORRADOR', () => {
    render(<Badge estado="BORRADOR" />);
    expect(screen.getByText(/borrador/i)).toBeInTheDocument();
  });

  it('renderiza estado APROBADA', () => {
    render(<Badge estado="APROBADA" />);
    expect(screen.getByText(/aprobada/i)).toBeInTheDocument();
  });

  it('renderiza estado desconocido sin romper', () => {
    render(<Badge estado="DESCONOCIDO" />);
    expect(screen.getByText(/desconocido/i)).toBeInTheDocument();
  });
});