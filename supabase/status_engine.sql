-- ====================================================================
-- BUILDER ATHLETE MANAGER - AUTOMATIC STATUS CALCULATION ENGINE
-- Connects securely to Supabase PostgreSQL database
-- ====================================================================

-- 1. Function to compute payment status based on amounts and dates
CREATE OR REPLACE FUNCTION public.calculate_payment_status(
    p_importo_previsto NUMERIC,
    p_importo_pagato NUMERIC,
    p_data_scadenza DATE,
    p_current_status TEXT
)
RETURNS TEXT AS $$
DECLARE
    v_diff_days INTEGER;
BEGIN
    -- Preserve explicit terminal or refund statuses
    IF p_current_status IN ('annullato', 'fallito', 'rimborsato', 'parzialmente rimborsato') THEN
        RETURN p_current_status;
    END IF;

    -- Pagamento completo
    IF p_importo_previsto > 0 AND p_importo_pagato >= p_importo_previsto THEN
        RETURN 'pagato';
    END IF;

    -- Pagamento incompleto
    IF p_importo_pagato > 0 AND p_importo_pagato < p_importo_previsto THEN
        RETURN 'pagato parzialmente';
    END IF;

    -- Check dates for unpaid items
    IF p_data_scadenza IS NULL THEN
        RETURN 'programmato';
    END IF;

    v_diff_days := p_data_scadenza - CURRENT_DATE;

    IF v_diff_days > 7 THEN
        RETURN 'programmato';
    ELSIF v_diff_days >= 1 AND v_diff_days <= 7 THEN
        RETURN 'in scadenza';
    ELSIF v_diff_days = 0 THEN
        RETURN 'da pagare';
    ELSE
        IF p_current_status = 'sollecitato' THEN
            RETURN 'sollecitato';
        END IF;
        RETURN 'scaduto';
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 2. Function to compute subscription status
CREATE OR REPLACE FUNCTION public.calculate_subscription_status(
    p_start_date DATE,
    p_end_date DATE,
    p_current_status TEXT
)
RETURNS TEXT AS $$
DECLARE
    v_diff_days INTEGER;
BEGIN
    IF p_current_status IN ('sospeso', 'bozza', 'annullato', 'rinnovato') THEN
        RETURN p_current_status;
    END IF;

    IF p_start_date > CURRENT_DATE THEN
        RETURN 'futuro';
    END IF;

    IF p_end_date < CURRENT_DATE THEN
        RETURN 'scaduto';
    END IF;

    v_diff_days := p_end_date - CURRENT_DATE;

    IF v_diff_days >= 0 AND v_diff_days <= 7 THEN
        RETURN 'in_scadenza';
    END IF;

    RETURN 'attivo';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 3. Procedure to recalculate all statuses safely in Supabase
CREATE OR REPLACE FUNCTION public.recalculate_all_statuses()
RETURNS JSONB AS $$
DECLARE
    v_updated_payments INTEGER := 0;
    v_updated_subscriptions INTEGER := 0;
    v_updated_athletes INTEGER := 0;
BEGIN
    -- Update payments status
    WITH updated_p AS (
        UPDATE public.financial_payments
        SET status = public.calculate_payment_status(amount, COALESCE(paid_amount, 0), due_date, status)
        WHERE status IS DISTINCT FROM public.calculate_payment_status(amount, COALESCE(paid_amount, 0), due_date, status)
        RETURNING id
    )
    SELECT COUNT(*) INTO v_updated_payments FROM updated_p;

    -- Return JSON summary of updated counts
    RETURN jsonb_build_object(
        'success', true,
        'updated_payments', v_updated_payments,
        'updated_subscriptions', v_updated_subscriptions,
        'updated_athletes', v_updated_athletes,
        'timestamp', NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
