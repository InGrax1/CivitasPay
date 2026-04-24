import { useState } from 'react';
import { FilePlus, DollarSign, User, Hash, Calendar } from 'lucide-react';
import { useContratos, useCrearContrato, useRegistrarPago, useCambiarEstadoContrato } from '../hooks/useContratos';
import useObraStore from '../store/obraStore';
import useAuthStore from '../store/authStore';
import ContratoCard from '../components/contratos/ContratoCard';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import { formatCurrencyCompact } from '../utils/formatCurrency';

// Modal nuevo contrato
function ModalNuevoContrato({ obraId, onClose }) {
  const [form, setForm] = useState({
    proveedor: '',
    monto_total: '',
    fecha_inicio: '',
    fecha_termino_estimada: '',
    concepto: '',
    notas: '',
  });

  const crearContrato = useCrearContrato(obraId);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await crearContrato.mutateAsync({
      ...form,
      monto_total: parseFloat(form.monto_total),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">

        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Nuevo Contrato</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Ingresa los datos para registrar un nuevo contrato
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">

          {/* Fila 1: Proveedor + Monto */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-civitas-blue">
                *Proveedor/Vendedor:
              </label>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-civitas-blue">
                <div className="px-3 text-gray-400"><User size={15} /></div>
                <input
                  type="text"
                  name="proveedor"
                  value={form.proveedor}
                  onChange={handleChange}
                  placeholder="Nombre del proveedor"
                  required
                  className="flex-1 py-2.5 pr-3 text-sm outline-none bg-transparent"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-civitas-blue">
                *Monto Bruto del contrato:
              </label>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-civitas-blue">
                <div className="px-3 text-gray-400"><DollarSign size={15} /></div>
                <input
                  type="number"
                  name="monto_total"
                  value={form.monto_total}
                  onChange={handleChange}
                  placeholder="0.00"
                  required min="0" step="0.01"
                  className="flex-1 py-2.5 pr-3 text-sm outline-none bg-transparent"
                />
              </div>
            </div>
          </div>

          {/* Fila 2: Fechas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-civitas-blue">
                *Fecha de Inicio/fin:
              </label>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-civitas-blue">
                <div className="px-3 text-gray-400"><Calendar size={15} /></div>
                <input
                  type="date"
                  name="fecha_inicio"
                  value={form.fecha_inicio}
                  onChange={handleChange}
                  required
                  className="flex-1 py-2.5 pr-3 text-sm outline-none bg-transparent"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">
                Fecha de término estimada:
              </label>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-civitas-blue">
                <div className="px-3 text-gray-400"><Calendar size={15} /></div>
                <input
                  type="date"
                  name="fecha_termino_estimada"
                  value={form.fecha_termino_estimada}
                  onChange={handleChange}
                  className="flex-1 py-2.5 pr-3 text-sm outline-none bg-transparent"
                />
              </div>
            </div>
          </div>

          {/* Concepto */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Concepto:</label>
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-civitas-blue">
              <div className="px-3 text-gray-400"><Hash size={15} /></div>
              <input
                type="text"
                name="concepto"
                value={form.concepto}
                onChange={handleChange}
                placeholder="Descripción del contrato"
                className="flex-1 py-2.5 pr-3 text-sm outline-none bg-transparent"
              />
            </div>
          </div>

          {/* Notas */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Notas:</label>
            <textarea
              name="notas"
              value={form.notas}
              onChange={handleChange}
              placeholder="Notas adicionales..."
              rows={3}
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-civitas-blue resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              loading={crearContrato.isPending}
            >
              Crear Contrato
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal registrar pago
function ModalPago({ obraId, contrato, onClose }) {
  const [monto, setMonto] = useState('');
  const [fechaPago, setFechaPago] = useState(new Date().toISOString().split('T')[0]);
  const [metodoPago, setMetodoPago] = useState('TRANSFERENCIA');
  const registrarPago = useRegistrarPago(obraId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await registrarPago.mutateAsync({
      id: contrato.id,
      data: {
        monto: parseFloat(monto),
        fecha_pago: fechaPago,
        metodo_pago: metodoPago,
      },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-5">
        <h3 className="font-bold text-gray-800 mb-1">Registrar Pago</h3>
        <p className="text-xs text-gray-400 mb-4">
          {contrato.proveedor} — Pendiente: {formatCurrencyCompact(contrato.monto_pendiente)}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Monto</label>
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-civitas-blue">
              <div className="px-3 text-gray-400"><DollarSign size={15} /></div>
              <input
                type="number"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder="0.00"
                required min="0" step="0.01"
                max={contrato.monto_pendiente}
                className="flex-1 py-2.5 pr-3 text-sm outline-none bg-transparent"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Fecha de Pago</label>
            <input
              type="date"
              value={fechaPago}
              onChange={(e) => setFechaPago(e.target.value)}
              required
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-civitas-blue"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Método de Pago</label>
            <select
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-civitas-blue bg-white"
            >
              <option value="TRANSFERENCIA">Transferencia</option>
              <option value="CHEQUE">Cheque</option>
              <option value="EFECTIVO">Efectivo</option>
              <option value="OTRO">Otro</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              loading={registrarPago.isPending}
            >
              Registrar Pago
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ContratosPage() {
  const { obraSeleccionada } = useObraStore();
  const usuario = useAuthStore((s) => s.usuario);
  const esAdmin = usuario?.rol === 'ADMINISTRADOR';

  const [modalNuevo, setModalNuevo]         = useState(false);
  const [modalPago, setModalPago]           = useState(false);
  const [contratoSeleccionado, setContratoSeleccionado] = useState(null);

  const { data: contratos = [], isLoading } = useContratos(obraSeleccionada?.id);
  const cambiarEstado = useCambiarEstadoContrato(obraSeleccionada?.id);

  // KPIs
  const totalContratado = contratos.reduce(
    (acc, c) => acc + parseFloat(c.monto_total || 0), 0
  );
  const totalPagado = contratos.reduce(
    (acc, c) => acc + parseFloat(c.monto_pagado || 0), 0
  );
  const totalPendiente = contratos.reduce(
    (acc, c) => acc + parseFloat(c.monto_pendiente || 0), 0
  );

  if (!obraSeleccionada) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400 text-sm">Selecciona una obra del menú superior</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 page-enter">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Contratos</h1>
          <p className="text-sm text-gray-400">
            Contratos activos dentro de {obraSeleccionada.nombre}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            icon={DollarSign}
            size="sm"
            onClick={() => {
              if (contratos.length > 0) {
                setContratoSeleccionado(contratos[0]);
                setModalPago(true);
              }
            }}
          >
            Registrar Pago
          </Button>
          <Button
            icon={FilePlus}
            size="sm"
            onClick={() => setModalNuevo(true)}
          >
            Nuevo Contrato
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-400">Total Contratado</p>
          <p className="text-2xl font-bold text-civitas-blue mt-1">
            {formatCurrencyCompact(totalContratado)}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {contratos.length} contratos
          </p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-400">Total Pagado</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {formatCurrencyCompact(totalPagado)}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-400">Total Pendiente</p>
          <p className="text-2xl font-bold text-orange-500 mt-1">
            {formatCurrencyCompact(totalPendiente)}
          </p>
        </div>
      </div>

      {/* Grid de contratos */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner text="Cargando contratos..." />
        </div>
      ) : contratos.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-200">
          <p className="text-gray-400 text-sm">No hay contratos registrados</p>
          <button
            onClick={() => setModalNuevo(true)}
            className="mt-2 text-civitas-blue text-sm font-medium hover:underline"
          >
            Crear primer contrato →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {contratos.map((contrato) => (
            <div key={contrato.id} className="flex flex-col gap-2">
              <ContratoCard
                contrato={contrato}
                onClick={() => {
                  setContratoSeleccionado(contrato);
                  setModalPago(true);
                }}
              />
              {/* Acciones rápidas */}
              {esAdmin && contrato.estado === 'ACTIVO' && (
                <button
                  onClick={() => cambiarEstado.mutate({
                    id: contrato.id,
                    estado: 'PAUSADO',
                  })}
                  className="text-xs text-gray-400 hover:text-yellow-600 transition-colors text-center"
                >
                  Pausar contrato
                </button>
              )}
              {esAdmin && contrato.estado === 'PAUSADO' && (
                <button
                  onClick={() => cambiarEstado.mutate({
                    id: contrato.id,
                    estado: 'ACTIVO',
                  })}
                  className="text-xs text-gray-400 hover:text-green-600 transition-colors text-center"
                >
                  Reactivar contrato
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modales */}
      {modalNuevo && (
        <ModalNuevoContrato
          obraId={obraSeleccionada.id}
          onClose={() => setModalNuevo(false)}
        />
      )}
      {modalPago && contratoSeleccionado && (
        <ModalPago
          obraId={obraSeleccionada.id}
          contrato={contratoSeleccionado}
          onClose={() => {
            setModalPago(false);
            setContratoSeleccionado(null);
          }}
        />
      )}
    </div>
  );
}

export default ContratosPage;