import { withHealthHandler } from '../../server/lib/http.js';
import { getAuthHealthStatus } from '../../authService.js';

export default withHealthHandler(getAuthHealthStatus);
