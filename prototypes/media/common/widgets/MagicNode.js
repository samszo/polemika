class MagicNode extends MagicObject {

    constructor($node) {
        super();
        this.node = $node;
        this.node.data("dom-object", this);
    }
}