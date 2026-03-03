import useFetch from "../../hooks/useFetch";
import "./propertyList.css";

const PropertyList = () => {
  const { data, loading } = useFetch("/hotels/countByType");

  const images = [
    "/images/luxury-room1.jpg",
    "/images/apartment.jpg",
    "/images/resort.jpg",
    "/images/villa.jpg",
    "/images/cabins.jpg",
  ];

  const handleImageError = (e) => {
    e.target.src = "/images/fallback.jpg";
  };
  return (
    <div className="pList">
      {loading ? (
        "loading"
      ) : (
        <>
          {data &&
            images.map((img,i) => (
              <div className="pListItem" key={i}>
                <img
                  src={img}
                  alt=""
                  className="pListImg"
                  onError={handleImageError}
                />
                <div className="pListTitles">
                  <h1>{data[i]?.type}</h1>
                  <h2>{data[i]?.count} {data[i]?.type}</h2>
                </div>
              </div>
            ))}
        </>
      )}
    </div>
  );
};

export default PropertyList;
