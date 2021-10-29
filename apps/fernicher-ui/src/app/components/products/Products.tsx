import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Grid from '@material-ui/core/Grid';
import { Dialog } from '@mui/material';
import ProductsSocialCard from './ProductsSocialCard';
import { find, isEmpty, map, reduce, upperFirst } from 'lodash';
import { useParams } from 'react-router-dom';
import { stateContext } from '../../providers/StateProvider';
import Map from '../Map/Map';

function Products() {
  const { products, setProducts } = useContext(stateContext);
  const { cat } =
    useParams<{ cat: 'recent' | 'chair' | 'table' | 'all' | 'search' }>();
  useEffect(() => {
    if (cat === 'search') {
      return;
    }
    const filter = { name: '', orderBy: 'createdAt', desc: true, take: 1000 };
    if (cat !== 'recent' && cat !== 'all') {
      filter.name = cat;
    } else if (cat === 'recent') {
      filter.take = 4;
    }
    axios
      .post<any[]>('/api/products/search', filter)
      .then((res) => {
        setProducts(res.data);
      })
      .catch((err) => console.log(err));
  }, [cat]);

  useEffect(() => {
    setProducts(products);
    const productExpanded = reduce(
      products,
      (result, product) => ({ ...result, [product.id]: false }),
      {}
    );
    setExpanded(productExpanded);
  }, [products]);
  const [detail, setDetail] = useState<any>({ expanded: false, product: null });

  const [expanded, setExpanded] = useState<any>({});
  return (
    <div>
      <h1>{upperFirst(cat)}</h1>
      {isEmpty(products) && <h3>No products found.</h3>}
      <Grid container spacing={4}>
        {map(products, (usersAndProduct: any) => (
          <Grid item md={3}>
            <ProductsSocialCard
              setExpanded={(id: number, isExpanded: boolean) =>
                setExpanded({ ...expanded, [id]: isExpanded })
              }
              expanded={expanded[usersAndProduct.id]}
              key={usersAndProduct.id}
              usersAndProduct={usersAndProduct}
              showProduct={(id: number) => {
                setDetail({
                  expanded: true,
                  product: find(products, (p) => p.id === id),
                });
              }}
            />
          </Grid>
        ))}
      </Grid>
      {detail.product && (
        <Dialog
          open={true}
          onClose={() => {
            setDetail({ expanded: false, product: null });
          }}
          maxWidth="lg"
        >
          <ProductsSocialCard
            setExpanded={(id: number, isExpanded: boolean) =>
              setDetail({ ...detail, expanded: isExpanded })
            }
            expanded={detail.expanded}
            usersAndProduct={detail.product}
            maxWidth="110vh"
            minWidth="110vh"
          />
        </Dialog>
      )}
      <br />
      <br />
      <hr />
      <Map mapTitle="Products on Map" width="100%" />
    </div>
  );
}

export default Products;
