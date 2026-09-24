export const KommentarConstants = {

    KOMMENTAR: {
        TABLE_NAME: 'kommentare',
        COLUMN: {
            KOMMENTAR_URL: 'kommentar_url',
            INHALT: 'inhalt',
            AUTOR_ID: 'autor_id',
            AUTOR_NAME: 'autor_name',
            ZIEL_ID: 'ziel_id',
            ZIEL_TYP: 'ziel_typ',
            PARENT_ID: 'parent_id',
            LIKES: 'likes',
        },
        LENGTH: {
            KOMMENTAR_URL: 255,
            AUTOR_NAME: 100,
            ZIEL_TYP: 50,
        },
        INDEX: {
            UK_KOMMENTAR_URL: 'uk_kommentar_url',
            IDX_AUTOR_ID: 'idx_autor_id',
            IDX_ZIEL: 'idx_ziel',
            IDX_PARENT_ID: 'idx_parent_id',
        },
    },
} as const;
