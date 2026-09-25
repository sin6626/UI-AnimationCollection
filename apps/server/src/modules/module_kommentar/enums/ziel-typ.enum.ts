/**
 * 评论目标类型
 * 用于标识一条评论是评论哪种对象的
 */
export enum ZielTyp {
    /** 文章 */
    ARTIKEL = 'artikel',

    /** 帖子 */
    POST = 'post',

    /** 商品 */
    PRODUKT = 'produkt',

    /** 视频 */
    VIDEO = 'video',

    /** 图片 */
    BILD = 'bild',

    /** 用户 */
    BENUTZER = 'benutzer',
}
