import "./DataTables.scss";

function formatValue(value, kind = "number") {
  if (value == null) {
    return "-";
  }

  if (kind === "currency") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(value);
  }

  if (typeof value === "number") {
    return Number.isInteger(value) ? value : value.toFixed(2);
  }

  return value;
}

function TableSection({ title, subtitle, columns, rows }) {
  return (
    <section className="data-block">
      <div className="data-block-header">
        <div>
          <p className="eyebrow">Workbook Data</p>
          <h3>{title}</h3>
        </div>
        <span>{rows.length} rows</span>
      </div>
      {subtitle ? <p className="data-subtitle">{subtitle}</p> : null}
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key}>{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id ?? row.partNo ?? row.sku ?? index}>
                {columns.map((column) => (
                  <td key={column.key} data-label={column.label}>
                    {formatValue(row[column.key], column.kind)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function DataTables({ supportingData }) {
  if (!supportingData) {
    return null;
  }

  const { powder, packing, rawMaterials, wax } = supportingData;

  return (
    <details className="data-details">
      <summary className="data-summary">View full workbook reference tables</summary>
      <section className="data-sections">
        <div className="data-overview">
          <div className="metric-card">
            <span>Powder Recipes</span>
            <strong>{powder.recipes.length}</strong>
          </div>
          <div className="metric-card">
            <span>Packing Items</span>
            <strong>{packing.items.length}</strong>
          </div>
          <div className="metric-card">
            <span>Raw Materials</span>
            <strong>{rawMaterials.length}</strong>
          </div>
          <div className="metric-card">
            <span>Wax Recipes</span>
            <strong>{wax.recipes.length}</strong>
          </div>
        </div>
        <TableSection
          title="Powder Sheet"
          subtitle={`Wax rate ${powder.settings.waxRate}, perfume ${powder.settings.perfumeRate}, white powder ${powder.settings.whitePowderRate}, water ratio ${powder.settings.waterRatio}.`}
          columns={[
            { key: "id", label: "#" },
            { key: "mould", label: "Mould" },
            { key: "totalWeight", label: "M+W gms" },
            { key: "water", label: "Water gms" },
            { key: "wax", label: "Wax gms" },
            { key: "perfume", label: "Perfume" },
            { key: "cost", label: "Cost", kind: "currency" },
            { key: "sell", label: "Sell", kind: "currency" }
          ]}
          rows={powder.recipes}
        />
        <TableSection
          title="Packing Sheet"
          subtitle={`Packing margin base ${packing.settings.marginRate}.`}
          columns={[
            { key: "partNo", label: "Part No" },
            { key: "description", label: "Description" },
            { key: "qty", label: "Qty" },
            { key: "costPrice", label: "Cost", kind: "currency" },
            { key: "margin", label: "Margin", kind: "currency" },
            { key: "sellingPrice", label: "Sell", kind: "currency" }
          ]}
          rows={packing.items}
        />
        <TableSection
          title="Raw Material Sheet"
          columns={[
            { key: "partNo", label: "Part No" },
            { key: "description", label: "Description" },
            { key: "qty", label: "Qty" },
            { key: "costPrice", label: "Cost Price", kind: "currency" }
          ]}
          rows={rawMaterials}
        />
        <TableSection
          title="Wax Sheet"
          subtitle={`Wax rate ${wax.settings.waxRate}, perfume rate ${wax.settings.perfumeRate}, wax cost ${formatValue(wax.settings.waxCost, "currency")}, perfume cost ${formatValue(wax.settings.perfumeCost, "currency")}.`}
          columns={[
            { key: "id", label: "#" },
            { key: "mould", label: "Mould" },
            { key: "totalWeight", label: "M+W gms" },
            { key: "wax", label: "Wax gms" },
            { key: "perfume", label: "Perfume" },
            { key: "resin", label: "Resin", kind: "currency" },
            { key: "sale", label: "Sale", kind: "currency" }
          ]}
          rows={wax.recipes}
        />
      </section>
    </details>
  );
}


