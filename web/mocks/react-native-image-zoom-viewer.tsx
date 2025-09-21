import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Image, Text } from 'react-native';

interface ImageInfo {
  url: string;
  props?: any;
}

interface ImageViewerProps {
  imageUrls: ImageInfo[];
  index?: number;
  onSwipeDown?: () => void;
  renderHeader?: (currentIndex?: number) => React.ReactElement;
  renderFooter?: (currentIndex?: number) => React.ReactElement;
  backgroundColor?: string;
  enableSwipeDown?: boolean;
  saveToLocalByLongPress?: boolean;
  onClick?: (onCancel?: () => void) => void;
  onChange?: (index?: number) => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({
  imageUrls,
  index = 0,
  onSwipeDown,
  renderHeader,
  renderFooter,
  backgroundColor = 'black',
  onClick,
  onChange,
}) => {
  const [currentIndex, setCurrentIndex] = useState(index);

  const goToPrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : imageUrls.length - 1;
    setCurrentIndex(newIndex);
    onChange?.(newIndex);
  };

  const goToNext = () => {
    const newIndex = currentIndex < imageUrls.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(newIndex);
    onChange?.(newIndex);
  };

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onSwipeDown) {
        onSwipeDown();
      } else if (event.key === 'ArrowLeft') {
        goToPrevious();
      } else if (event.key === 'ArrowRight') {
        goToNext();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onSwipeDown, goToPrevious, goToNext]);

  const handleImageClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <View style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
    }}>
      {/* X Close Button */}
      <TouchableOpacity
        onPress={onSwipeDown}
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000,
        }}
      >
        <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>×</Text>
      </TouchableOpacity>

      {/* Header */}
      {renderHeader && renderHeader(currentIndex)}

      {/* Main Image */}
      <View style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
        <TouchableOpacity onPress={handleImageClick} style={{ width: '100%', height: '100%' }}>
          <Image
            source={{ uri: imageUrls[currentIndex]?.url }}
            style={{
              width: '100%',
              height: '100%',
              resizeMode: 'contain',
            }}
          />
        </TouchableOpacity>
      </View>

      {/* Navigation */}
      {imageUrls.length > 1 && (
        <>
          <TouchableOpacity
            onPress={goToPrevious}
            style={{
              position: 'absolute',
              left: 20,
              top: '50%',
              transform: [{ translateY: -25 }],
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>‹</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={goToNext}
            style={{
              position: 'absolute',
              right: 20,
              top: '50%',
              transform: [{ translateY: -25 }],
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>›</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Footer */}
      {renderFooter && renderFooter(currentIndex)}

      {/* Close on background click */}
      <TouchableOpacity
        onPress={onSwipeDown}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
        }}
      />
    </View>
  );
};

export default ImageViewer;