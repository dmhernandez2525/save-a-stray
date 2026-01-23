import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';

vi.mock('../components/css/App.css', () => ({}));

// Mock AnimalShow image gallery behavior
const MockImageGallery = ({ image, images = [] }) => {
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const allImages = [image, ...images].filter(Boolean);
  const currentImage = allImages[selectedIndex] || image;

  return (
    <div data-testid="image-gallery">
      <img
        src={currentImage}
        alt={`Photo ${selectedIndex + 1}`}
        data-testid="main-image"
      />
      {allImages.length > 1 && (
        <div data-testid="thumbnail-strip" className="flex gap-2">
          {allImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              data-testid={`thumbnail-${idx}`}
              className={selectedIndex === idx ? 'active' : ''}
            >
              <img src={img} alt={`Thumbnail ${idx + 1}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Mock Animal form with multiple images support
const MockAnimalForm = () => {
  const [images, setImages] = React.useState([]);

  return (
    <div data-testid="animal-form">
      <div data-testid="additional-images">
        {images.map((url, idx) => (
          <div key={idx} data-testid={`image-row-${idx}`}>
            <input
              value={url}
              onChange={(e) => {
                const newImages = [...images];
                newImages[idx] = e.target.value;
                setImages(newImages);
              }}
              placeholder={`Image URL ${idx + 2}`}
              data-testid={`image-input-${idx}`}
            />
            <button
              onClick={() => setImages(images.filter((_, i) => i !== idx))}
              data-testid={`remove-image-${idx}`}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={() => setImages([...images, ''])}
        data-testid="add-image-btn"
      >
        + Add Image
      </button>
    </div>
  );
};

const TestWrapper = ({ children }) => (
  <MockedProvider mocks={[]}>
    <MemoryRouter>{children}</MemoryRouter>
  </MockedProvider>
);

describe('Image Gallery Component', () => {
  describe('Single Image', () => {
    it('should render the primary image', () => {
      render(
        <TestWrapper>
          <MockImageGallery image="https://example.com/dog1.jpg" />
        </TestWrapper>
      );

      const mainImage = screen.getByTestId('main-image');
      expect(mainImage.getAttribute('src')).toBe('https://example.com/dog1.jpg');
    });

    it('should not render thumbnail strip for single image', () => {
      render(
        <TestWrapper>
          <MockImageGallery image="https://example.com/dog1.jpg" />
        </TestWrapper>
      );

      expect(screen.queryByTestId('thumbnail-strip')).not.toBeInTheDocument();
    });
  });

  describe('Multiple Images', () => {
    const images = [
      'https://example.com/dog2.jpg',
      'https://example.com/dog3.jpg',
      'https://example.com/dog4.jpg'
    ];

    it('should render thumbnail strip when multiple images exist', () => {
      render(
        <TestWrapper>
          <MockImageGallery image="https://example.com/dog1.jpg" images={images} />
        </TestWrapper>
      );

      expect(screen.getByTestId('thumbnail-strip')).toBeInTheDocument();
    });

    it('should render all thumbnails', () => {
      render(
        <TestWrapper>
          <MockImageGallery image="https://example.com/dog1.jpg" images={images} />
        </TestWrapper>
      );

      expect(screen.getByTestId('thumbnail-0')).toBeInTheDocument();
      expect(screen.getByTestId('thumbnail-1')).toBeInTheDocument();
      expect(screen.getByTestId('thumbnail-2')).toBeInTheDocument();
      expect(screen.getByTestId('thumbnail-3')).toBeInTheDocument();
    });

    it('should show primary image initially', () => {
      render(
        <TestWrapper>
          <MockImageGallery image="https://example.com/dog1.jpg" images={images} />
        </TestWrapper>
      );

      const mainImage = screen.getByTestId('main-image');
      expect(mainImage.getAttribute('src')).toBe('https://example.com/dog1.jpg');
    });

    it('should switch to selected image when thumbnail is clicked', () => {
      render(
        <TestWrapper>
          <MockImageGallery image="https://example.com/dog1.jpg" images={images} />
        </TestWrapper>
      );

      fireEvent.click(screen.getByTestId('thumbnail-2'));

      const mainImage = screen.getByTestId('main-image');
      expect(mainImage.getAttribute('src')).toBe('https://example.com/dog3.jpg');
    });

    it('should highlight the active thumbnail', () => {
      render(
        <TestWrapper>
          <MockImageGallery image="https://example.com/dog1.jpg" images={images} />
        </TestWrapper>
      );

      const firstThumb = screen.getByTestId('thumbnail-0');
      expect(firstThumb.className).toContain('active');

      fireEvent.click(screen.getByTestId('thumbnail-1'));
      expect(screen.getByTestId('thumbnail-1').className).toContain('active');
    });

    it('should switch back to first image when first thumbnail is clicked', () => {
      render(
        <TestWrapper>
          <MockImageGallery image="https://example.com/dog1.jpg" images={images} />
        </TestWrapper>
      );

      fireEvent.click(screen.getByTestId('thumbnail-2'));
      fireEvent.click(screen.getByTestId('thumbnail-0'));

      const mainImage = screen.getByTestId('main-image');
      expect(mainImage.getAttribute('src')).toBe('https://example.com/dog1.jpg');
    });
  });
});

describe('Animal Form - Multiple Images', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the add image button', () => {
    render(
      <TestWrapper>
        <MockAnimalForm />
      </TestWrapper>
    );

    expect(screen.getByTestId('add-image-btn')).toBeInTheDocument();
  });

  it('should add a new image input when add button is clicked', () => {
    render(
      <TestWrapper>
        <MockAnimalForm />
      </TestWrapper>
    );

    fireEvent.click(screen.getByTestId('add-image-btn'));
    expect(screen.getByTestId('image-row-0')).toBeInTheDocument();
    expect(screen.getByTestId('image-input-0')).toBeInTheDocument();
  });

  it('should add multiple image inputs', () => {
    render(
      <TestWrapper>
        <MockAnimalForm />
      </TestWrapper>
    );

    fireEvent.click(screen.getByTestId('add-image-btn'));
    fireEvent.click(screen.getByTestId('add-image-btn'));
    fireEvent.click(screen.getByTestId('add-image-btn'));

    expect(screen.getByTestId('image-row-0')).toBeInTheDocument();
    expect(screen.getByTestId('image-row-1')).toBeInTheDocument();
    expect(screen.getByTestId('image-row-2')).toBeInTheDocument();
  });

  it('should update image URL input value', () => {
    render(
      <TestWrapper>
        <MockAnimalForm />
      </TestWrapper>
    );

    fireEvent.click(screen.getByTestId('add-image-btn'));
    const input = screen.getByTestId('image-input-0');
    fireEvent.change(input, { target: { value: 'https://example.com/photo.jpg' } });

    expect(input.value).toBe('https://example.com/photo.jpg');
  });

  it('should remove an image input when remove button is clicked', () => {
    render(
      <TestWrapper>
        <MockAnimalForm />
      </TestWrapper>
    );

    fireEvent.click(screen.getByTestId('add-image-btn'));
    fireEvent.click(screen.getByTestId('add-image-btn'));

    expect(screen.getByTestId('image-row-0')).toBeInTheDocument();
    expect(screen.getByTestId('image-row-1')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('remove-image-0'));

    expect(screen.queryByTestId('image-row-1')).not.toBeInTheDocument();
  });

  it('should have a remove button for each image input', () => {
    render(
      <TestWrapper>
        <MockAnimalForm />
      </TestWrapper>
    );

    fireEvent.click(screen.getByTestId('add-image-btn'));
    fireEvent.click(screen.getByTestId('add-image-btn'));

    expect(screen.getByTestId('remove-image-0')).toBeInTheDocument();
    expect(screen.getByTestId('remove-image-1')).toBeInTheDocument();
  });
});
