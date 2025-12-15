import { useState } from 'react';
import './AdminGameGallery.css';

// Import local images from src/images
import img1 from '../images/anhchop.webp';
import img2 from '../images/images.webp';
import img3 from '../images/phuonghang.webp';
import img4 from '../images/sharkbinh.webp';

// Sample Data
const GAMES = [
  { id: 1, img: img1, title: 'Công viên nước' },
  { id: 2, img: img2, title: 'Tàu lượn siêu tốc' },
  { id: 3, img: img3, title: 'Khu vui chơi trẻ em' },
  { id: 4, img: img4, title: 'Hồ tạo sóng' },
  // Duplicate for seamless loop
  { id: 5, img: img1, title: 'Công viên nước' },
  { id: 6, img: img2, title: 'Tàu lượn siêu tốc' },
  { id: 7, img: img3, title: 'Khu vui chơi trẻ em' },
  { id: 8, img: img4, title: 'Hồ tạo sóng' },
];

const AdminGameGallery = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const openModal = (imgSrc: string) => {
    setSelectedImage(imgSrc);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  return (
    <div className="admin-gallery-section">
      <h2 className="admin-gallery-title">Thư viện Trò chơi & Dự án</h2>
      <div className="admin-gallery-container">
        <div className="admin-gallery-track">
          {GAMES.map((game, index) => (
            <div 
              key={`${game.id}-${index}`} 
              className="admin-gallery-item"
              onClick={() => openModal(game.img)}
            >
              <img src={game.img} alt={game.title} className="admin-gallery-img" />
              <div className="admin-gallery-overlay">
                <span>{game.title}</span>
              </div>
            </div>
          ))}
          {/* Duplicate set for infinite scroll smooth connection */}
          {GAMES.map((game, index) => (
            <div 
              key={`dup-${game.id}-${index}`} 
              className="admin-gallery-item"
              onClick={() => openModal(game.img)}
            >
              <img src={game.img} alt={game.title} className="admin-gallery-img" />
              <div className="admin-gallery-overlay">
                <span>{game.title}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal / Zoom */}
      {selectedImage && (
        <div className="admin-gallery-modal" onClick={closeModal}>
          <div className="admin-gallery-modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={selectedImage} alt="Zoomed" className="admin-gallery-zoomed-img" />
            <button className="admin-gallery-close" onClick={closeModal}>✕</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGameGallery;
