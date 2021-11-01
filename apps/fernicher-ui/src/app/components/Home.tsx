import axios from 'axios';
import { map } from 'lodash';
import React, { useContext, useEffect, useState } from 'react';
import { stateContext } from '../providers/StateProvider';
import Map from './Map/Map';
import { Recommendation } from './products/Recommendation';

function Home(props: any) {
  const { productOnMap, setProducts } = useContext(stateContext);
  useEffect(() => {
    !productOnMap &&
      axios
        .post<any[]>('/api/users')
        .then((res) => {
          const products: any = [];
          map(res.data, (user) => {
            products.push(
              ...map(user.products, (product) => ({ ...product, user }))
            );
          });
          setProducts(products);
        })
        .catch((err) => console.log('ERR HAPPENED', err));
    productOnMap && setProducts([productOnMap]);
  }, [productOnMap]);

  return (
    <div className="mainContent">
      <Recommendation
        imageWidth="16vh"
        imageHeight="21vh"
        imageRootHeight="22vh"
        className="all-product-recommendation"
      />
      <Map />
    </div>
  );
}

export default Home;
