import React, {useRef} from 'react';
import {ProductItem} from './ProductItem';
import {AddToCartButton} from './AddToCartButton';

function mapHomepageFeatured(fields: any[] = []) {
  const result: any = {};

  fields.forEach((field) => {
    if (field.key === 'collection' && field.reference) {
      result.collection = field.reference;
    }

    if (field.key === 'products' && field.references) {
      result.products = field.references.nodes || [];
    }

    if (field.key !== 'collection' && field.key !== 'products') {
      result[field.key] = field.value;
    }
  });

  return result;
}
export default function CollectionCarousel({collection}: {collection: any}) {
  if (!collection) return null;

  const fields = mapHomepageFeatured(collection.fields);
  console.log(fields, 'FIELDS IN CAROUSEL');
  const rawLimit = fields.limit != null ? Number(fields.limit) : null;

  const sourceProducts =
    fields.products || fields.collection?.products?.nodes || [];

  const products =
    rawLimit && rawLimit > 0
      ? sourceProducts.slice(0, rawLimit)
      : sourceProducts;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const trackRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const isDragging = useRef(false);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const startX = useRef(0);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const scrollLeft = useRef(0);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const velocity = useRef(0);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const rafId = useRef<number | null>(null);

  const applyMomentum = () => {
    const el = trackRef.current;
    if (!el) return;

    el.scrollLeft += velocity.current;
    velocity.current *= 0.96; // slow decay = smooth glide

    if (Math.abs(velocity.current) > 0.4) {
      rafId.current = requestAnimationFrame(applyMomentum);
    }
  };

  /* ---------- BUTTON SCROLL ---------- */
  const scrollByCard = (direction: 'left' | 'right') => {
    const container = trackRef.current;
    if (!container) return;

    const card = container.querySelector('[data-card]') as HTMLElement;
    if (!card) return;

    const gap = 16;
    const amount = card.offsetWidth + gap;

    container.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  /* ---------- DRAG START ---------- */
  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.pageX;
    scrollLeft.current = trackRef.current!.scrollLeft;
    velocity.current = 0;

    cancelAnimationFrame(rafId.current!);
  };

  /* ---------- DRAG MOVE ---------- */
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;

    e.preventDefault();

    const x = e.pageX;
    const walk = (x - startX.current) * 1.4; // more freedom
    const prev = trackRef.current!.scrollLeft;

    trackRef.current!.scrollLeft = scrollLeft.current - walk;

    velocity.current = trackRef.current!.scrollLeft - prev;
  };

  /* ---------- INERTIA / MOMENTUM ---------- */

  /* ---------- DRAG END ---------- */
  const stopDragging = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    applyMomentum();
  };

  return (
    <section className="w-full py-12 overflow-hidden">
      {/* ---------- HEADER ---------- */}
      <div className="flex items-center justify-between px-6 mb-6">
        <h2 className="text-2xl font-semibold">
          {fields.collection?.title || fields.title || 'Featured Products'}
        </h2>

        <div className="flex gap-3">
          <button
            onClick={() => scrollByCard('left')}
            className="w-10 h-10 rounded-full bg-black text-white text-xl"
          >
            ‹
          </button>
          <button
            onClick={() => scrollByCard('right')}
            className="w-10 h-10 rounded-full bg-black text-white text-xl"
          >
            ›
          </button>
        </div>
      </div>

      {/* ---------- CAROUSEL ---------- */}
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div
        ref={trackRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={stopDragging}
        onMouseLeave={stopDragging}
        className="
  flex gap-4 px-6
  overflow-x-auto
  cursor-grab active:cursor-grabbing
  select-none
  scrollbar-hide
  touch-pan-x
"
      >
        {products.map((product: any) => {
          const variant = product.variants.nodes[0];
          return (
            <>
            <div
              key={product.id}
              data-card
              className="
              snap-start
              flex-shrink-0
              w-[260px]
              sm:w-[300px]
              md:w-[340px]
            "
            >
              <ProductItem product={product} />
        {String(fields.show_add_to_cart) === 'true' && (
  <AddToCartButton
    disabled={!variant?.availableForSale}
    onClick={() => open('cart')}
    lines={[
      {
        merchandiseId: variant.id,
        quantity: 1,
      },
    ]}
  >
    Add to cart
  </AddToCartButton>
)}
            </div>
              </>
          );
        })}
      </div>
    </section>
  );
}
