/**
 * IHookable — Optional interface for plugins that want to hook into Core lifecycle events.
 *
 * Any plugin (marketplace, invoicing, shipping, etc.) can implement this
 * to register hooks that run before/after Core actions.
 */
export interface IHookable {
    /**
     * Called after onLoad(). Plugin can register hooks via ctx.hooks.register().
     *
     * Available hook events:
     *   - product.beforeCreate / product.afterCreate
     *   - product.beforeUpdate / product.afterUpdate
     *   - order.beforeCreate   / order.afterCreate
     *   - order.beforeStatusChange / order.afterStatusChange
     *   - inventory.beforeUpdate / inventory.afterUpdate
     */
    registerHooks?(): Promise<void>;
}
