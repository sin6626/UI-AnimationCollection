class Snowflake {
    private readonly epoch = 1700000000000n;
    private readonly workerIdBits = 10n;
    private readonly sequenceBits = 12n;

    private readonly maxWorkerId = -1n ^ (-1n << this.workerIdBits);
    private readonly maxSequence = -1n ^ (-1n << this.sequenceBits);

    private readonly workerIdShift = this.sequenceBits;
    private readonly timestampShift = this.sequenceBits + this.workerIdBits;

    private workerId: bigint;
    private sequence = 0n;
    private lastTimestamp = -1n;

    constructor(workerId = 1) {
        if (workerId < 0 || BigInt(workerId) > this.maxWorkerId) {
            throw new Error(`workerId must be between 0 and ${this.maxWorkerId}`);
        }
        this.workerId = BigInt(workerId);
    }

    nextId(): string {
        let timestamp = BigInt(Date.now());

        if (timestamp < this.lastTimestamp) {
            throw new Error('Clock moved backwards. Refusing to generate id.');
        }

        if (timestamp === this.lastTimestamp) {
            this.sequence = (this.sequence + 1n) & this.maxSequence;
            if (this.sequence === 0n) {
                while (timestamp <= this.lastTimestamp) {
                    timestamp = BigInt(Date.now());
                }
            }
        } else {
            this.sequence = 0n;
        }

        this.lastTimestamp = timestamp;

        const id =
            ((timestamp - this.epoch) << this.timestampShift) |
            (this.workerId << this.workerIdShift) |
            this.sequence;

        return id.toString();
    }
}

const snowflake = new Snowflake(1);

export function generateSnowflakeId(): string {
    return snowflake.nextId();
}
