import React from 'react';

/**
 * Componente de barra de progresso.
 * Recebe o valor concluído e o total de itens e exibe uma barra
 * proporcional. Útil para indicar percentuais de conclusão.
 */
export default function ProgressBar({
  value,
  total,
}: {
  value: number;
  total: number;
}) {
  const percent = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="w-full bg-gray-200 rounded h-3" aria-label="barra de progresso">
      <div
        className="bg-green-600 h-3 rounded"
        style={{ width: `${percent}%` }}
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
}