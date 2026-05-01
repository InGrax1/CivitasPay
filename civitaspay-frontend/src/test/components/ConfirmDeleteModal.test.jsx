import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmDeleteModal from '../../components/ui/ConfirmDeleteModal';

const defaultProps = {
  titulo:    'Eliminar Obra',
  nombre:    'Torre Sur',
  onConfirm: vi.fn(),
  onClose:   vi.fn(),
  loading:   false,
};

describe('ConfirmDeleteModal', () => {
  it('renderiza el título correctamente', () => {
  render(<ConfirmDeleteModal {...defaultProps} />);
  expect(screen.getByRole('heading', { name: 'Eliminar Obra' })).toBeInTheDocument();
  });

  it('muestra el nombre de la obra', () => {
    render(<ConfirmDeleteModal {...defaultProps} />);
    expect(screen.getAllByText('Torre Sur').length).toBeGreaterThan(0);
  });

  it('botón eliminar está deshabilitado si el input está vacío', () => {
    render(<ConfirmDeleteModal {...defaultProps} />);
    const boton = screen.getByRole('button', { name: /eliminar/i });
    expect(boton).toBeDisabled();
  });

  it('botón eliminar está deshabilitado si el nombre no coincide', () => {
    render(<ConfirmDeleteModal {...defaultProps} />);
    const input = screen.getByPlaceholderText(/escribe el nombre/i);
    fireEvent.change(input, { target: { value: 'nombre incorrecto' } });
    const boton = screen.getByRole('button', { name: /eliminar/i });
    expect(boton).toBeDisabled();
  });

  it('botón eliminar se habilita cuando el nombre coincide exactamente', () => {
    render(<ConfirmDeleteModal {...defaultProps} />);
    const input = screen.getByPlaceholderText(/escribe el nombre/i);
    fireEvent.change(input, { target: { value: 'Torre Sur' } });
    const boton = screen.getByRole('button', { name: /eliminar/i });
    expect(boton).not.toBeDisabled();
  });

  it('llama onConfirm al hacer click con nombre correcto', () => {
    const onConfirm = vi.fn();
    render(<ConfirmDeleteModal {...defaultProps} onConfirm={onConfirm} />);
    const input = screen.getByPlaceholderText(/escribe el nombre/i);
    fireEvent.change(input, { target: { value: 'Torre Sur' } });
    fireEvent.click(screen.getByRole('button', { name: /eliminar/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('llama onClose al hacer click en Cancelar', () => {
    const onClose = vi.fn();
    render(<ConfirmDeleteModal {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});