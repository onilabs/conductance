/* (c) 2013-2019 Oni Labs, http://onilabs.com
 *
 * This file is part of Conductance.
 *
 * It is subject to the license terms in the LICENSE file
 * found in the top-level directory of this distribution.
 * No part of Conductance, including this file, may be
 * copied, modified, propagated, or distributed except
 * according to the terms contained in the LICENSE file.
 */

/** @nodoc */
// XXX need to figure out API for lifecycle - see https://app.asana.com/0/882077202919/7740493937036

// The idea is to use this as a baseclass for custom filters
// The inherited class must set an `upstream` member
exports.Filter = {
  read: lookup_descriptor -> this.upstream.read(lookup_descriptor),

  write: entity_descriptor -> this.upstream.write(entity_descriptor),

  query: query_descriptor -> this.upstream.query(query_descriptor),

  withTransaction: function(options, block) {
//    console.log("TRANSACTION");
    this.upstream.withTransaction(options) {
      |transaction|
      var transaction_ctx = Object.create(this);
      transaction_ctx.upstream = transaction;
      transaction_ctx.in_transaction = true;
      block(transaction_ctx);
    }
  },

  watch: change_observer -> this.upstream.watch(change_observer)

};

