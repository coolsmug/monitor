const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const miscellaneousSchema = new Schema(
  {
    roll_no: {
        type: String,
        trim: true,
       
      },
      student_name: {
        type: String,
        trim: true,
       
      },
      classofs : {
        type: String,
        trim: true,
  
      },
      term: {
        type: String,
        trim: true,
       
      },
      _learner: {
        type: mongoose.Types.ObjectId,
        trim: true,
      },
      pun: {
        type: String,
      },
      att_in_cl: {
        type: String
      },
      neat: {
        type: String,
      },
      pol: {
        type: String,
      },
      r_w_s: {
        type: String,
      },
      r_w_l: {
        type: String,
      },
      spirit_o_co: {
        type: String,
      },
      sense_o_r: {
        type: String,
      },
      attent: {
        type: String,
      },
      honesty: {
        type: String,
      },
      iniatives: {
        type: String
      },
      per: {
        type: String,
      },
      h_w : {
        type: String,
      },
      m_s : {
        type: String,
      },
      sport: {
        type: String,
      },
      craft: {
        type: String,
      },
      h_o_t: {
        type: String,
      },
      d_and_p : {
        type: String
      },
      next_t_fee: {
        type: String,
      },
     payable: {
        type: String,
      },
      debt: {
        type: String,
      },
      no_of_t_s_opened: {
        type: String,
      },
      total_att: {
        type: String,
      },
     per_att: {
        type: String,
      },
      t_c: {
        type: String,
      },
      t_n: {
        type: String,
      },
      h_t_c: {
        type: String,
      },
      schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'School'
      },


  },
  { timestamps: true }
);



const Miscellaneous = mongoose.model('Miscellaneous', miscellaneousSchema);
module.exports = Miscellaneous
