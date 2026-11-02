/**
 * dsh-studio — Host half.
 *
 * The workbench is a pure browser surface: parsing, compliance scanning, copy
 * generation and canvas rendering all run in the client, so no Host service,
 * Remote or tool is registered here. This module exists only because the
 * profile loader mounts one Host entry per bundle row; `apply` deliberately
 * does nothing and therefore has nothing to clean up.
 *
 * @param _ctx - Host Cordis context (unused).
 * @param _config - Row config from cordis.patch.yml (unused).
 */
export function apply(_ctx, _config) {}
