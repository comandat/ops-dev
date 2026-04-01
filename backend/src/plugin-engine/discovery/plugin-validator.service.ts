import { Injectable, Logger } from '@nestjs/common';
import { IPluginBase, PluginCapability } from '../interfaces/plugin-base.interface';

export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}

/**
 * PluginValidator — Validates a plugin at load time.
 *
 * Checks:
 * 1. Required manifest fields (name, version, capabilities, configFields)
 * 2. Each declared capability maps to an existing method on the class
 * 3. Warns about undeclared methods that look like capabilities
 */
@Injectable()
export class PluginValidator {
    private readonly logger = new Logger(PluginValidator.name);

    /** Maps capability names to the method they require on the class */
    private readonly capabilityMethodMap: Record<PluginCapability, string> = {
        getOrders: 'getOrders',
        pushProduct: 'pushProduct',
        updateStock: 'updateStock',
        onOrderUpdated: 'onOrderUpdated',
        emitInvoice: 'emitInvoice',
        generateAWB: 'generateAWB',
        trackShipment: 'trackShipment',
    };

    /** Methods that LOOK like capabilities but might not be declared */
    private readonly knownCapabilityMethods = Object.values(this.capabilityMethodMap);

    validate(plugin: IPluginBase, pluginPath: string): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];
        const { manifest } = plugin;

        // ── Required manifest fields ────────────────────────────────────
        if (!manifest.name) errors.push('manifest.name is required');
        if (!manifest.version) errors.push('manifest.version is required');
        if (!manifest.author) errors.push('manifest.author is required');

        if (!Array.isArray(manifest.capabilities)) {
            errors.push('manifest.capabilities must be an array (can be empty [])');
        }

        if (!Array.isArray(manifest.configFields)) {
            errors.push('manifest.configFields must be an array (can be empty [])');
        }

        // ── Verify each declared capability has the matching method ─────
        for (const cap of (manifest.capabilities || [])) {
            const methodName = this.capabilityMethodMap[cap];
            if (!methodName) {
                warnings.push(`Unknown capability '${cap}' — will be ignored by CapabilityRouter`);
                continue;
            }
            if (typeof (plugin as any)[methodName] !== 'function') {
                errors.push(
                    `Capability '${cap}' declared but method '${methodName}()' not found on plugin class`,
                );
            }
        }

        // ── Warn about undeclared capability-looking methods ────────────
        for (const method of this.knownCapabilityMethods) {
            if (typeof (plugin as any)[method] === 'function') {
                const capName = method as PluginCapability;
                if (!(manifest.capabilities || []).includes(capName)) {
                    warnings.push(
                        `Method '${method}()' found but '${capName}' not declared in manifest.capabilities — ` +
                        `platform will NOT auto-wire this. Add '${capName}' to capabilities array.`,
                    );
                }
            }
        }

        // ── onLoad is mandatory ─────────────────────────────────────────
        if (typeof plugin.onLoad !== 'function') {
            errors.push('onLoad(config, ctx) method is required on every plugin');
        }

        const valid = errors.length === 0;

        if (!valid) {
            this.logger.error(`[PluginValidator] INVALID plugin at ${pluginPath}:\n  ${errors.join('\n  ')}`);
        }
        if (warnings.length > 0) {
            this.logger.warn(`[PluginValidator] Warnings for ${manifest.name}:\n  ${warnings.join('\n  ')}`);
        }
        if (valid && warnings.length === 0) {
            this.logger.log(`[PluginValidator] ✅ ${manifest.name} — capabilities: [${(manifest.capabilities || []).join(', ')}]`);
        }

        return { valid, errors, warnings };
    }
}
