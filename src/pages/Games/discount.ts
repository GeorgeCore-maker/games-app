type Deal = {
    savings: string;
    normalPrice: string;
    salePrice: string;
};

/**
 * Porcentaje de descuento de una oferta.
 *
 * `savings` viene de CheapShark como porcentaje con decimales ("10.001667"
 * = 10%), NO como fraccion. Se medio contra la API para no suponerlo.
 * Si `savings` viene a 0 pero los precios si difieren, se calcula: hay ofertas
 * marcadas como isOnSale con savings a 0.
 */
export function discountPercent(deal: Deal): number {
    const savings = Number(deal.savings);
    if (Number.isFinite(savings) && savings > 0) {
        return Math.min(100, Math.round(savings));
    }

    const normal = Number(deal.normalPrice);
    const sale = Number(deal.salePrice);
    if (normal > 0 && sale >= 0 && sale < normal) {
        return Math.min(100, Math.round((1 - sale / normal) * 100));
    }

    return 0;
}

export type DiscountTier = 'fuego' | 'alta' | 'media' | 'baja' | 'sin';

const UMBRALES: Array<{ desde: number; tier: DiscountTier }> = [
    { desde: 70, tier: 'fuego' },
    { desde: 50, tier: 'alta' },
    { desde: 25, tier: 'media' },
    { desde: 10, tier: 'baja' },
    { desde: 1, tier: 'sin' },
];

/**
 * Los umbrales estan calibrados con los descuentos que existen de verdad: se
 * llego a ver un 100%, y hay repartidos en 75-89, 50-74 y 25-49. Un umbral de
 * "fuego" a 70% si es muestra alguna vez.
 */
export function discountTier(porcentaje: number): DiscountTier {
    const encontrado = UMBRALES.find((u) => porcentaje >= u.desde);
    return encontrado ? encontrado.tier : 'sin';
}
