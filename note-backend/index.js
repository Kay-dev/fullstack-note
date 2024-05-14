// Server network declaration

const app = require('./app');
const config = require('./utils/config');
const logger = require('./utils/logger');

const port = config.PORT || 3000
app.listen(port, () => {
    logger.info(`Server running on port ${port}`);
})