import useFetch from "../../hooks/useFetch";
import "./featuredProperties.css";

const FeaturedProperties = () => {
  const { data, loading } = useFetch("/hotels?featured=true&limit=4");

  const fallbackImages = [
    "/images/luxury-room1.jpg",
    "/images/luxury-room2.jpg",
    "/images/luxury-room3.jpg",
    "/images/luxury-room4.jpg",
  ];

  const handleImageError = (e) => {
    e.target.src = "/images/fallback.jpg";
  };
  
  return (
    <div className="fp">
      {loading ? (
        "Loading"
      ) : (
        <>
          {data.map((item, index) => (
            <div className="fpItem" key={item._id}>
              <img
                src={item.photos?.[0] || fallbackImages[index % fallbackImages.length]}
                alt=""
                className="fpImg"
                onError={handleImageError}
              />
              <span className="fpName">{item.name}</span>
              <span className="fpCity">{item.city}</span>
              <span className="fpPrice">Starting from ${item.cheapestPrice}</span>
              {item.rating && <div className="fpRating">
                <button>{item.rating}</button>
                <span>Excellent</span>
              </div>}
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default FeaturedProperties;
