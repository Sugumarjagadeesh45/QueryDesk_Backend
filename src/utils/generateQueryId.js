const Query = require('../models/Query');

/**
 * Generates the next query ID in the format QRY-XXXX.
 * Finds the last inserted query, extracts the number, and increments it.
 */
const generateQueryId = async () => {
  const lastQuery = await Query.findOne().sort({ queryId: -1 }).select('queryId');

  if (!lastQuery || !lastQuery.queryId) {
    return 'QRY-1001';
  }

  // Extract the numeric part from "QRY-XXXX"
  const lastNumber = parseInt(lastQuery.queryId.split('-')[1], 10);
  const nextNumber = lastNumber + 1;

  return `QRY-${nextNumber}`;
};

module.exports = generateQueryId;
