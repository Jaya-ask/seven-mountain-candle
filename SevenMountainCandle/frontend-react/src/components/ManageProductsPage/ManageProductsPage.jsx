import { useEffect, useMemo, useRef, useState } from "react";
import "./ManageProductsPage.scss";

function createEmptyDraft() {
  return {
    sku: "",
    name: "",
    description: "",
    uom: "",
    material: "",
    packing: "",
    price: "",
    tags: [],
    nextTag: "",
    categoryIds: [],
    images: []
  };
}

function createDraftFromProduct(product) {
  if (!product) {
    return createEmptyDraft();
  }

  return {
    sku: product.sku || "",
    name: product.name || "",
    description: product.description || "",
    uom: product.uom || "",
    material: product.material?.toString() || "",
    packing: product.packing?.toString() || "",
    price: product.price?.toString() || "",
    tags: Array.isArray(product.tags)
      ? product.tags
          .map((tag) => tag?.toString().trim() || "")
          .filter(Boolean)
      : [],
    nextTag: "",
    categoryIds: Array.isArray(product.categoryIds) ? product.categoryIds : [],
    images: Array.isArray(product.images)
      ? product.images.map((image, index) => ({
        url: image?.url || "",
        isPrimary: Boolean(image?.isPrimary),
        sortOrder: Number.isFinite(Number(image?.sortOrder)) ? Number(image.sortOrder) : index
      }))
      : []
  };
}

function normalizeImages(images) {
  const validImages = Array.isArray(images)
    ? images
        .map((entry, index) => ({
          url: entry?.url?.toString().trim() || "",
          isPrimary: Boolean(entry?.isPrimary),
          sortOrder: Number.isFinite(Number(entry?.sortOrder)) ? Number(entry.sortOrder) : index
        }))
        .filter((entry) => entry.url)
    : [];

  if (validImages.length > 0 && !validImages.some((entry) => entry.isPrimary)) {
    validImages[0].isPrimary = true;
  }

  const firstPrimaryIndex = validImages.findIndex((entry) => entry.isPrimary);

  return validImages.map((entry, index) => ({
    ...entry,
    isPrimary: firstPrimaryIndex === index,
    sortOrder: Number(entry.sortOrder)
  }));
}

function buildPayloadFromDraft(draft) {
  return {
    sku: draft.sku.trim(),
    name: draft.name.trim(),
    description: draft.description.trim(),
    uom: draft.uom.trim(),
    material: Number(draft.material),
    packing: Number(draft.packing),
    price: Number(draft.price),
    tags: Array.from(
      new Set(
        (Array.isArray(draft.tags) ? draft.tags : [])
          .map((tag) => tag?.toString().trim() || "")
          .filter(Boolean)
      )
    ),
    categoryIds: Array.from(new Set(draft.categoryIds.map((entry) => entry.trim()).filter(Boolean))),
    images: normalizeImages(draft.images)
  };
}

function ProductForm({
  title,
  draft,
  categories,
  submitting,
  submitLabel,
  onChange,
  onSubmit
}) {
  function addTag() {
    onChange((current) => {
      const nextTag = current.nextTag.trim();
      if (!nextTag) {
        return current;
      }

      if (current.tags.some((entry) => entry.toLowerCase() === nextTag.toLowerCase())) {
        return {
          ...current,
          nextTag: ""
        };
      }

      return {
        ...current,
        tags: [...current.tags, nextTag],
        nextTag: ""
      };
    });
  }

  return (
    <section className="manage-products__form-card">
      <h3>{title}</h3>
      <div className="manage-products__grid">
        <label>
          SKU
          <input
            value={draft.sku}
            onChange={(event) => onChange((current) => ({ ...current, sku: event.target.value }))}
          />
        </label>
        <label>
          Product Name
          <input
            value={draft.name}
            onChange={(event) => onChange((current) => ({ ...current, name: event.target.value }))}
          />
        </label>
        <label>
          UOM
          <input
            value={draft.uom}
            onChange={(event) => onChange((current) => ({ ...current, uom: event.target.value }))}
          />
        </label>
        <label>
          Price
          <input
            type="number"
            min="0"
            step="0.01"
            value={draft.price}
            onChange={(event) => onChange((current) => ({ ...current, price: event.target.value }))}
          />
        </label>
        <label>
          Material
          <input
            type="number"
            min="0"
            step="0.01"
            value={draft.material}
            onChange={(event) => onChange((current) => ({ ...current, material: event.target.value }))}
          />
        </label>
        <label>
          Packing
          <input
            type="number"
            min="0"
            step="0.01"
            value={draft.packing}
            onChange={(event) => onChange((current) => ({ ...current, packing: event.target.value }))}
          />
        </label>
      </div>

      <label className="manage-products__block-field">
        Description
        <textarea
          rows={4}
          value={draft.description}
          onChange={(event) => onChange((current) => ({ ...current, description: event.target.value }))}
        />
      </label>

      <div className="manage-products__block-field">
        <span>Tags</span>
        <div className="manage-products__chips">
          {draft.tags.length === 0 ? <span className="manage-products__chip-placeholder">No tags added yet.</span> : null}
          {draft.tags.map((tag) => (
            <span key={`${title}-${tag}`} className="manage-products__chip">
              {tag}
              <button
                type="button"
                aria-label={`Remove ${tag}`}
                onClick={() => {
                  onChange((current) => ({
                    ...current,
                    tags: current.tags.filter((entry) => entry !== tag)
                  }));
                }}
              >
                x
              </button>
            </span>
          ))}
        </div>
        <div className="manage-products__chip-editor">
          <input
            value={draft.nextTag}
            placeholder="Type tag and click Add"
            onChange={(event) => onChange((current) => ({ ...current, nextTag: event.target.value }))}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addTag();
              }
            }}
          />
          <button type="button" onClick={addTag}>Add</button>
        </div>
      </div>

      <fieldset className="manage-products__categories">
        <legend>Categories</legend>
        <div className="manage-products__checkboxes">
          {categories.map((category) => {
            const checked = draft.categoryIds.includes(category.id);

            return (
              <label key={category.id}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(event) => {
                    if (event.target.checked) {
                      onChange((current) => ({
                        ...current,
                        categoryIds: Array.from(new Set([...current.categoryIds, category.id]))
                      }));
                      return;
                    }

                    onChange((current) => ({
                      ...current,
                      categoryIds: current.categoryIds.filter((id) => id !== category.id)
                    }));
                  }}
                />
                {category.name}
              </label>
            );
          })}
        </div>
      </fieldset>

      <section className="manage-products__images">
        <div className="manage-products__images-header">
          <h4>Images</h4>
          <button
            type="button"
            onClick={() => {
              onChange((current) => ({
                ...current,
                images: [
                  ...current.images,
                  {
                    url: "",
                    isPrimary: current.images.length === 0,
                    sortOrder: current.images.length
                  }
                ]
              }));
            }}
          >
            Add image
          </button>
        </div>

        {draft.images.length === 0 ? <p className="manage-products__muted">No images added yet.</p> : null}

        <div className="manage-products__images-list">
          {draft.images.map((image, index) => (
            <article key={`${title}-image-${index}`} className="manage-products__image-row">
              <div className="manage-products__image-preview-wrap">
                {image.url ? (
                  <img
                    src={image.url}
                    alt={`Preview ${index + 1}`}
                    className="manage-products__image-preview"
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                    onLoad={(event) => {
                      event.currentTarget.style.display = "block";
                    }}
                  />
                ) : (
                  <div className="manage-products__image-placeholder">No preview</div>
                )}
              </div>
              <input
                placeholder="https://example.com/image.jpg"
                value={image.url}
                onChange={(event) => {
                  const nextUrl = event.target.value;
                  onChange((current) => ({
                    ...current,
                    images: current.images.map((entry, entryIndex) => (
                      entryIndex === index ? { ...entry, url: nextUrl } : entry
                    ))
                  }));
                }}
              />
              <button
                type="button"
                className={image.isPrimary ? "primary" : ""}
                onClick={() => {
                  onChange((current) => ({
                    ...current,
                    images: current.images.map((entry, entryIndex) => ({
                      ...entry,
                      isPrimary: entryIndex === index
                    }))
                  }));
                }}
              >
                {image.isPrimary ? "Primary" : "Set primary"}
              </button>
              <button
                type="button"
                className="danger"
                onClick={() => {
                  onChange((current) => ({
                    ...current,
                    images: current.images.filter((_, entryIndex) => entryIndex !== index)
                  }));
                }}
              >
                Remove
              </button>
            </article>
          ))}
        </div>
      </section>

      <div className="manage-products__actions">
        <button type="button" onClick={onSubmit} disabled={submitting}>
          {submitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </section>
  );
}

export default function ManageProductsPage({ authToken, onCatalogRefresh }) {
  const toastTimerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [products, setProducts] = useState([]);
  const [productsSearch, setProductsSearch] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedSku, setSelectedSku] = useState("");
  const [editDraft, setEditDraft] = useState(createEmptyDraft());
  const [createDraft, setCreateDraft] = useState(createEmptyDraft());
  const [editState, setEditState] = useState("");
  const [createState, setCreateState] = useState("");
  const [deleteState, setDeleteState] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [savingCreate, setSavingCreate] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [successToast, setSuccessToast] = useState("");

  useEffect(() => {
    if (!authToken) {
      return;
    }

    let isMounted = true;

    async function fetchAdminProducts() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/admin/products", {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        });

        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(payload?.message || "Unable to load products.");
        }

        if (!isMounted) {
          return;
        }

        const productList = Array.isArray(payload.products) ? payload.products : [];
        const categoryList = Array.isArray(payload.categories) ? payload.categories : [];

        setProducts(productList);
        setCategories(categoryList);

        if (productList.length > 0) {
          const initialSku = selectedSku || productList[0].sku;
          const selectedProduct = productList.find((entry) => entry.sku === initialSku) || productList[0];
          setSelectedSku(selectedProduct.sku);
          setEditDraft(createDraftFromProduct(selectedProduct));
        } else {
          setSelectedSku("");
          setEditDraft(createEmptyDraft());
        }
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        setProducts([]);
        setCategories([]);
        setError(requestError?.message || "Unable to load products.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchAdminProducts();

    return () => {
      isMounted = false;
    };
  }, [authToken]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  function showSuccessToast(message) {
    setSuccessToast(message);

    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = window.setTimeout(() => {
      setSuccessToast("");
    }, 2600);
  }

  const selectedProduct = useMemo(
    () => products.find((entry) => entry.sku === selectedSku) || null,
    [products, selectedSku]
  );

  const filteredProducts = useMemo(() => {
    const normalizedSearch = productsSearch.trim().toLowerCase();

    if (!normalizedSearch) {
      return products;
    }

    return products.filter((product) => {
      const name = product?.name?.toString().toLowerCase() || "";
      const sku = product?.sku?.toString().toLowerCase() || "";
      return name.includes(normalizedSearch) || sku.includes(normalizedSearch);
    });
  }, [products, productsSearch]);

  useEffect(() => {
    setEditState("");
    setDeleteState("");

    if (selectedProduct) {
      setEditDraft(createDraftFromProduct(selectedProduct));
    }
  }, [selectedProduct]);

  async function handleUpdateProduct() {
    if (!selectedSku) {
      return;
    }

    setSavingEdit(true);
    setEditState("");

    try {
      const response = await fetch(`/api/admin/products/${encodeURIComponent(selectedSku)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify(buildPayloadFromDraft(editDraft))
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.message || "Unable to update product.");
      }

      const updatedProduct = payload?.product;
      if (updatedProduct?.sku) {
        setProducts((current) => current.map((entry) => (
          entry.sku === selectedSku ? updatedProduct : entry
        )));
        setSelectedSku(updatedProduct.sku);
      }

      setEditState("");
      showSuccessToast("Changes saved successfully.");
      onCatalogRefresh?.();
    } catch (requestError) {
      setEditState(requestError?.message || "Unable to update product.");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleCreateProduct() {
    setSavingCreate(true);
    setCreateState("");

    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify(buildPayloadFromDraft(createDraft))
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.message || "Unable to create product.");
      }

      const createdProduct = payload?.product;
      if (createdProduct?.sku) {
        setProducts((current) => [...current, createdProduct].sort((left, right) => left.sku.localeCompare(right.sku)));
        setSelectedSku(createdProduct.sku);
      }

      setCreateDraft(createEmptyDraft());
      setCreateState("");
      setShowCreateModal(false);
      showSuccessToast("Product created successfully.");
      onCatalogRefresh?.();
    } catch (requestError) {
      setCreateState(requestError?.message || "Unable to create product.");
    } finally {
      setSavingCreate(false);
    }
  }

  async function handleDeleteSelectedProduct() {
    if (!selectedProduct) {
      return;
    }

    const confirmed = window.confirm(`Delete product ${selectedProduct.sku}?`);
    if (!confirmed) {
      return;
    }

    setDeleteState("");

    try {
      const response = await fetch(`/api/admin/products/${encodeURIComponent(selectedProduct.sku)}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.message || "Unable to delete product.");
      }

      setProducts((current) => {
        const next = current.filter((entry) => entry.sku !== selectedProduct.sku);
        const fallback = next[0] || null;
        setSelectedSku(fallback?.sku || "");
        setEditDraft(fallback ? createDraftFromProduct(fallback) : createEmptyDraft());
        return next;
      });
      setDeleteState("");
      showSuccessToast("Product deleted successfully.");
      onCatalogRefresh?.();
    } catch (requestError) {
      setDeleteState(requestError?.message || "Unable to delete product.");
    }
  }

  return (
    <main className="manage-products-page">
      <section className="manage-products-page__panel">
        <header className="manage-products-page__header">
          <div>
            <p className="eyebrow">Admin Panel</p>
            <h2>Manage Products</h2>
          </div>
          <button
            type="button"
            className="manage-products__create-trigger"
            onClick={() => {
              setCreateState("");
              setCreateDraft(createEmptyDraft());
              setShowCreateModal(true);
            }}
          >
            Create Product
          </button>
        </header>

        {loading ? <p className="manage-products__meta">Loading products...</p> : null}
        {error ? <p className="manage-products__error">{error}</p> : null}

        {!loading && !error ? (
          <div className="manage-products__layout">
            <aside className="manage-products__list-card">
              <h3>Existing Products</h3>
              <label className="manage-products__list-search">
                <span>Search by name or SKU</span>
                <input
                  type="search"
                  placeholder="e.g. Rose, SMC-001"
                  value={productsSearch}
                  onChange={(event) => setProductsSearch(event.target.value)}
                />
              </label>
              {products.length === 0 ? <p className="manage-products__muted">No products found.</p> : null}
              {products.length > 0 && filteredProducts.length === 0 ? (
                <p className="manage-products__muted">No products match your search.</p>
              ) : null}
              <div className="manage-products__list">
                {filteredProducts.map((product) => (
                  <button
                    type="button"
                    key={product.sku}
                    className={`manage-products__list-item${selectedSku === product.sku ? " active" : ""}`}
                    onClick={() => setSelectedSku(product.sku)}
                  >
                    <strong>{product.name}</strong>
                    <span>{product.sku}</span>
                  </button>
                ))}
              </div>
            </aside>

            <div className="manage-products__editor">
              {selectedProduct ? (
                <>
                  <ProductForm
                    title="Edit Product"
                    draft={editDraft}
                    categories={categories}
                    submitting={savingEdit}
                    submitLabel="Save changes"
                    onChange={setEditDraft}
                    onSubmit={handleUpdateProduct}
                  />

                  <div className="manage-products__inline-messages">
                    {editState ? <p className="manage-products__meta">{editState}</p> : null}
                    {deleteState ? <p className="manage-products__meta">{deleteState}</p> : null}
                  </div>

                  <button
                    type="button"
                    className="manage-products__danger-button"
                    onClick={handleDeleteSelectedProduct}
                  >
                    Delete selected product
                  </button>
                </>
              ) : (
                <p className="manage-products__muted">Select a product to edit.</p>
              )}
            </div>
          </div>
        ) : null}

        {showCreateModal ? (
          <div
            className="manage-products__modal-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="Create product"
            onClick={() => {
              if (!savingCreate) {
                setShowCreateModal(false);
              }
            }}
          >
            <div className="manage-products__modal-content" onClick={(event) => event.stopPropagation()}>
              <div className="manage-products__modal-header">
                <h3>Create Product</h3>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  disabled={savingCreate}
                >
                  Close
                </button>
              </div>

              <ProductForm
                title="Create Product"
                draft={createDraft}
                categories={categories}
                submitting={savingCreate}
                submitLabel="Create product"
                onChange={setCreateDraft}
                onSubmit={handleCreateProduct}
              />
              {createState ? <p className="manage-products__meta">{createState}</p> : null}
            </div>
          </div>
        ) : null}

        {successToast ? (
          <div className="manage-products__toast" role="status" aria-live="polite">
            {successToast}
          </div>
        ) : null}
      </section>
    </main>
  );
}