const mongoose = require('mongoose');
const URLSlugs = require('mongoose-url-slugs');
const Schema = mongoose.Schema;
import associationSchema from "./association.schema";

const AssociationSchema = new Schema(associationSchema);

AssociationSchema.plugin(URLSlugs('name'));
module.exports = mongoose.model('Association', AssociationSchema);