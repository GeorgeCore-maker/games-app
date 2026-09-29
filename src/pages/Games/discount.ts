type Deal = {
    savings: string;
    normalPrice: string;
    salePrice: string;
};

/**
 * `savings` es porcentaje con decimales ("10.001667" = 10%), no fraccion. Si
 * viene a 0 pero los precios difieren, se recalcula: hay ofertas con isOnSale
 * y savings a 0.
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

/** Umbrales calibrados con la API: hay descuentos de 100, 95, 93, 90%. */
export function discountTier(porcentaje: number): DiscountTier {
    const encontrado = UMBRALES.find((u) => porcentaje >= u.desde);
    return encontrado ? encontrado.tier : 'sin';
}
