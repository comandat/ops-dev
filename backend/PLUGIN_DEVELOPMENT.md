# Plugin Development Guide - OpenSales

Build your own marketplace or service plugin for OpenSales.

## Quick Start

1. Create a folder inside `./plugins/` (e.g., `./plugins/my-marketplace`)
2. Add a `package.json` and an `index.js` exporting a class with the `IPlugin` shape
3. Restart the server — the PluginManager auto-discovers it

## Plugin Interface

Your plugin must export `{ default: YourClass }` where `YourClass` has:

```js
class MyPlugin {
  constructor() {
    this.manifest = {
      name: 'my-marketplace',       // Unique plugin ID
      version: '1.0.0',
      author: 'Your Name',
      description: 'Short description',
      configFields: [               // Shown in Plugin Manager UI
        { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      ],
    };
  }

  async onLoad(config) { }              // Called on activation (config = saved credentials)
  async getOrders() { }                 // Pull orders → inject into Core via API
  async pushProduct(productId) { }      // Push a product to your marketplace
  async updateStock(productId, stock) { } // Sync stock when Core inventory changes
  async onOrderUpdated(orderId, status) { } // React to Core order status changes
}

module.exports = { default: MyPlugin };
```

## Config Fields

| Type       | Renders as        |
|------------|-------------------|
| `string`   | Text input        |
| `password` | Hidden input      |
| `boolean`  | Toggle switch     |

## Event Flow

```
User updates stock in UI → ProductService.update()
  → EventBus.emit('inventory.updated')
    → Redis Queue → EventProcessor
      → calls plugin.updateStock() on ALL active plugins
```

## Reference

See `./plugins/emag-connector/index.js` for a complete working example.
