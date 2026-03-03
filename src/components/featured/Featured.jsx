import useFetch from "../../hooks/useFetch";
import "./featured.css";

const Featured = () => {
  const featuredCities = [
    { name: "Goa", image: "/images/resort.jpg" },
    { name: "Mumbai", image: "/images/luxury-room3.jpg" },
    { name: "Manali", image: "/images/cabins.jpg" },
  ];

  const { data, loading } = useFetch(
    `/hotels/countByCity?cities=${featuredCities
      .map((city) => city.name)
      .join(",")}`
  );

  const handleImageError = (e) => {
    e.target.src = "/images/fallback.jpg";
  };

  return (
    <div className="featured">
      {loading ? (
        "Loading please wait"
      ) : (
        <>
          {featuredCities.map((city, index) => (
            <div className="featuredItem" key={city.name}>
              <img
                src={city.image}
                alt={city.name}
                className="featuredImg"
                onError={handleImageError}
              />
              <div className="featuredTitles">
                <h1>{city.name}</h1>
                <h2>{Number(data?.[index] || 0)} properties</h2>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default Featured;
