import {Await, useLoaderData, Link} from 'react-router';
import type {Route} from './+types/_index';
import {Suspense, useRef} from 'react';
import {Image} from '@shopify/hydrogen';
import type {
  CollectionFragment,
  RecommendedProductsQuery,
} from 'storefrontapi.generated';
import {ProductItem} from '~/components/ProductItem';
import CollectionCarousel from '~/components/CollectionCarousel';

export const meta: Route.MetaFunction = () => {
  return [{title: 'Hydrogen | Home'}];
};

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context}: Route.LoaderArgs) {
  const [featuredResult, heroResult, selectedCollectionResult] = await Promise.all([
    context.storefront.query(HomepageFeaturedCollection, {
      cache: context.storefront.CacheNone(),
    }),
    context.storefront.query(HERO_BANNER_METAOBJECTS_QUERY, {
      cache: context.storefront.CacheNone(),
    }),
    context.storefront.query(SelectedCollectionQuery, {
      cache: context.storefront.CacheNone(),
    }), 
  ]);

  return {
    featuredCollection: featuredResult.metaobjects.nodes[0],
    heroBannerMetaobjects: heroResult.metaobjects.nodes,
    selectedCollections: selectedCollectionResult.metaobjects.nodes,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  const SelectedProducts = context.storefront
    .query(SelectedProductsQuery)
    .catch((error: Error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });
  return {
    SelectedProducts,
  };
}
function HeroBanner({metaobjects}: {metaobjects: any[]}) {
  return (
    <div className="w-full">
      {metaobjects.map((obj: any) => (
        <div key={obj.id || obj.heading} className="relative w-full h-96 flex items-center justify-center">
          {obj?.image && (
            <div className="absolute inset-0 w-full h-full">
              <img src={obj.image.url} alt={obj.heading || 'Hero Banner'} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="relative z-10 text-center text-white px-6">
            {obj?.heading && <h1 className="text-4xl md:text-5xl font-bold mb-4">{obj.heading}</h1>}
            {obj?.subheading && <p className="text-lg md:text-xl mb-6 opacity-90">{obj.subheading}</p>}
            {obj?.cta_text && obj?.cta_link && (
              <Link to={obj.cta_link} className="inline-block bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                {obj.cta_text}
              </Link>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
export default function Homepage() {
  const data = useLoaderData<typeof loader>();
  function mapHeroFields(fields: any[] = []) {
    const result: any = {};

    fields.forEach((field) => {
      if (field.key === 'image' && field.reference?.image) {
        result.image = field.reference.image;
      } else {
        result[field.key] = field.value;
      }
    });

    return result;
  }
  
  const heroBannerData = data.heroBannerMetaobjects?.map((obj: any) => mapHeroFields(obj.fields)) || [];
  const selectedCollections = data.selectedCollections[0].fields[0].references.nodes;
  return (
    <div className="home">
      {data.heroBannerMetaobjects && (
        <HeroBanner metaobjects={heroBannerData} />
      )}
      <CollectionCarousel collection={data.featuredCollection} />
      {selectedCollections.length > 0 && (
        <SelectedCollection title="Selected Collections" collections={selectedCollections} />
      )}
      {/* <Suspense fallback={null}>
  <Await resolve={data.SelectedProducts}>
    {(selectedProducts) => {
      console.log(selectedProducts, 'RESOLVED SelectedProducts');
      return null;
    }}
  </Await>
</Suspense> */}
        <Suspense fallback={<div>Loading…</div>}>
        <Await resolve={data.SelectedProducts}>
          {(selectedProducts) => (
            <CollectionCarousel collection={selectedProducts.metaobjects.nodes[0]} />
          )}
        </Await>
      </Suspense>
    </div>
  );
}
function SelectedCollection({title, collections}: {title: string; collections: CollectionFragment[]}) {
  return (
    <section className="w-full py-12">
     <h2 className="text-2xl font-semibold">
          {title}
        </h2>

      <div className="flex flex-col md:flex-row gap-6 px-6">
        {collections.map((collection) => (
          <Link
            key={collection.id}
            to={`/collections/${collection.handle}`}
            className="flex-1 group"
          >
            {collection.image && (
              <Image
                data={collection.image}
                alt={collection.title}
                className="w-full h-64 object-cover mb-4 group-hover:opacity-80 transition-opacity"
              />
            )}
            <h3 className="text-xl font-semibold text-center">
              {collection.title}
            </h3>
          </Link>
        ))}
      </div>
    </section>
  );
}


function RecommendedProducts({
  products,
}: {
  products: Promise<RecommendedProductsQuery | null>;
}) {
  return (
    <div className="recommended-products">
      <h2>Recommended Products</h2>
      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={products}>
          {(response) => (
            <div className="recommended-products-grid">
              {response
                ? response.products.nodes.map((product) => (
                    <ProductItem key={product.id} product={product} />
                  ))
                : null}
            </div>
          )}
        </Await>
      </Suspense>
      <br />
    </div>
  );
}

const HomepageFeaturedCollection = `query HomepageFeaturedCollection {
  metaobjects(type: "home_page_featured_collection", first: 1) {
    nodes {
      fields {
        key
        value
        reference {
          ... on Collection {
            id
            handle
            title
            products(first: 20) {
              nodes {
                id
                title
                handle
                featuredImage {
                  url
                  altText
                  width
                  height
                }
                priceRange {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                }
                variants(first: 1) {
                  nodes {
                    id
                    availableForSale
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
` as const;


const HERO_BANNER_METAOBJECTS_QUERY = `#graphql
  query HeroBannerMetaobjects {
    metaobjects(type: "hero_banner_image", first: 1) {
      nodes {
        fields {
          key
          value
          reference {
            ... on MediaImage {
              image {
                url
                altText
                width
                height
              }
            }
          }
        }
      }
    }
  }
` as const;

const SelectedCollectionQuery = `#graphql
query SelectedCollectionHomepage {
  metaobjects(type: "selected_collection_homepage", first: 1) {
    nodes {
      id
      fields {
        key
        references(first: 10) {
          nodes {
            ... on Collection {
              id
              title
              handle
              image {
                url
                altText
                width
                height
              }
            }
          }
        }
      }
    }
  }
}
` as const;


const SelectedProductsQuery = `#graphql
  query SelectedProducts {
    metaobjects(type: "homepage_selected_products", first: 1) {
      nodes {
        id
        fields {
          key
          value
          references(first: 10) {
            nodes {
              ... on Product {
                id
                title
                handle
                featuredImage {
                  url
                  altText
                  width
                  height
                }
                priceRange {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                }
                variants(first: 1) {
                  nodes {
                    id
                    availableForSale
                  }
                }
              }
            }
          }
        }
      }
    }
  }
` as const;
