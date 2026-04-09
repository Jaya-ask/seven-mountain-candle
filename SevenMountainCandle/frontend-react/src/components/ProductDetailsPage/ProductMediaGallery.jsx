import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";

export default function ProductMediaGallery({
  product,
  productImages,
  selectedImageIndex,
  selectedImage,
  hasMultipleImages,
  onSelectImage,
  onPreviousImage,
  onNextImage
}) {
  return (
    <div className="product-details-media-column">
      <div className="product-details-thumb-strip" aria-label="Product image thumbnails">
        {productImages.map((image, index) => (
          <button
            type="button"
            className={`product-details-thumb${selectedImageIndex === index ? " active" : ""}`}
            key={`${image}-${index}`}
            onClick={() => onSelectImage(index)}
            aria-label={`View product image ${index + 1}`}
          >
            <img src={image} alt={`${product.name} view ${index + 1}`} loading="lazy" />
          </button>
        ))}
      </div>

      <figure className="product-details-main-image">
        {hasMultipleImages ? (
          <button
            type="button"
            className="image-nav-button prev"
            onClick={onPreviousImage}
            aria-label="View previous image"
          >
            <ChevronLeftRoundedIcon />
          </button>
        ) : null}

        {selectedImage ? (
          <img src={selectedImage} alt={product.name} loading="eager" />
        ) : (
          <div className="product-details-image-fallback" aria-hidden="true" />
        )}

        {hasMultipleImages ? (
          <button
            type="button"
            className="image-nav-button next"
            onClick={onNextImage}
            aria-label="View next image"
          >
            <ChevronRightRoundedIcon />
          </button>
        ) : null}
      </figure>
    </div>
  );
}
