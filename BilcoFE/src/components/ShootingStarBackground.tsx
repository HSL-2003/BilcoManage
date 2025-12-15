import './ShootingStarBackground.css'

const ShootingStarBackground = () => {
    return (
        <div className="star-bg">
            <div className="night">
                {/* Static Stars */}
                {[...Array(10)].map((_, i) => (
                    <div key={`star-${i}`} className="star" style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 5}s`
                    }}></div>
                ))}
                
                {/* Shooting Stars */}
                {[...Array(5)].map((_, i) => (
                    <div key={`shooting-${i}`} className="shooting_star" style={{
                         top: `${Math.random() * 50}%`, // Mostly top half
                         left: `${Math.random() * 100}%`,
                         animationDelay: `${Math.random() * 4}s`
                    }}></div>
                ))}
            </div>
            {/* Overlay Gradient for depth */}
            <div className="bg-gradient-overlay"></div>
        </div>
    )
}

export default ShootingStarBackground
