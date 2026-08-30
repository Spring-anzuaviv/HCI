-- Store every workflow stage in one table. Existing machine runs are migrated
-- before the old table is removed.

ALTER TABLE laundry_orders
    ADD COLUMN ready_at TIMESTAMP(3),
    ADD COLUMN group_code VARCHAR(100);

UPDATE laundry_orders
SET service_type = 'WASH_DRY'
WHERE service_type = 'COMBO';

UPDATE machines
SET type = CASE type
    WHEN 'WASH' THEN 'WASHER'
    WHEN 'DRY' THEN 'DRYER'
    ELSE type
END;

CREATE TABLE order_stages (
    order_stage_id SERIAL NOT NULL,
    order_id INTEGER NOT NULL,
    machine_id INTEGER,
    stage VARCHAR(50) NOT NULL,
    planned_start_at TIMESTAMP(3),
    planned_end_at TIMESTAMP(3),
    actual_started_at TIMESTAMP(3),
    actual_ended_at TIMESTAMP(3),
    status VARCHAR(20) NOT NULL,

    CONSTRAINT order_stages_pkey PRIMARY KEY (order_stage_id)
);

INSERT INTO order_stages (
    order_id,
    machine_id,
    stage,
    planned_start_at,
    planned_end_at,
    actual_started_at,
    actual_ended_at,
    status
)
SELECT
    order_id,
    machine_id,
    CASE stage
        WHEN 'WASHING' THEN 'WASH'
        WHEN 'DRYING' THEN 'DRY'
        WHEN 'FOLDING_PACKING' THEN 'PACKING'
        ELSE stage
    END,
    started_at,
    ended_at,
    started_at,
    ended_at,
    CASE status
        WHEN 'PENDING' THEN 'PLANNED'
        WHEN 'RUNNING' THEN 'RUNNING'
        WHEN 'COMPLETED' THEN 'COMPLETED'
        ELSE 'CANCELLED'
    END
FROM machine_runs;

ALTER TABLE order_stages
    ADD CONSTRAINT order_stages_order_id_fkey
        FOREIGN KEY (order_id) REFERENCES laundry_orders(order_id) ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT order_stages_machine_id_fkey
        FOREIGN KEY (machine_id) REFERENCES machines(machine_id) ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX laundry_orders_group_code_idx ON laundry_orders(group_code);
CREATE INDEX laundry_orders_status_idx ON laundry_orders(status);
CREATE INDEX laundry_orders_pickup_at_idx ON laundry_orders(pickup_at);
CREATE INDEX order_stages_order_id_stage_idx ON order_stages(order_id, stage);
CREATE INDEX order_stages_machine_status_start_idx
    ON order_stages(machine_id, status, planned_start_at);

ALTER TABLE machines
    ADD CONSTRAINT machines_type_check CHECK (type IN ('WASHER', 'DRYER'));

ALTER TABLE laundry_orders
    ADD CONSTRAINT laundry_orders_service_type_check
        CHECK (service_type IN ('WASH', 'DRY', 'WASH_DRY'));

ALTER TABLE order_stages
    ADD CONSTRAINT order_stages_stage_check
        CHECK (stage IN ('SORTING', 'WASH', 'TRANSFER', 'DRY', 'PACKING')),
    ADD CONSTRAINT order_stages_status_check
        CHECK (status IN ('PLANNED', 'RUNNING', 'COMPLETED', 'CANCELLED'));

DROP TABLE machine_runs;
