/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const basic = require('./basic.js')

module.exports = grammar({
  name: "gf",

  extras: $ => [
    $.comment,
    /[\s\n\t]/
  ],

  rules: {
    source_file: $ => ($.mod_def),
    comment: _ => token(choice(

      prec(100, seq('--', /.*/)),
      seq('{--}'),
      seq(
        '{-',
        /[^#]/,
        repeat(choice(
          /[^-]/, // anything but -
          /-[^}]/, // - not followed by }
        )),
        /-}/,
      ),
    )),


    ident: _ => /[a-zA-Z_'0-9]+/,
    double: $ => $.float,

    mod_def: $ => seq(optional($.compl_mod), $._mod_type, '=', $.mod_body),

    mod_header: $ => seq(optional($.compl_mod), $._mod_type, '=', optional($.mod_header_body)),

    compl_mod: _ => 'incomplete',

    _mod_type: $ => choice(
      $.mt_abstract,
      $.mt_resource,
      $.mt_interface,
      $.mt_concrete,
      $.mt_instance
    ),
    mt_abstract: $ => seq('abstract', $.module_name),
    mt_resource: $ => seq('resource', $.module_name),
    mt_interface: $ => seq('interface', $.module_name),
    mt_concrete: $ => seq('concrete', $.module_name, 'of', $.module_name),
    mt_instance: $ => seq('instance', $.module_name, 'of', $.module_name),

    mod_header_body: $ => choice(
      seq($.list_included, '**', $.included, 'with', $.list_inst, '**', optional($.mod_open)),
      seq($.list_included, '**', $.included, 'with', $.list_inst),
      seq($.list_included, '**', optional($.mod_open)),
      seq($.list_included),
      seq($.included, 'with', $.list_inst, '**', optional($.mod_open)),
      seq($.included, 'with', $.list_inst),
      $.mod_open
    ),

    mod_open: $ => seq('open', $.list_open),

    mod_body: $ => choice(
      seq($.list_included, '**', $.included, 'with', $.list_inst, '**', $.mod_content),
      seq($.list_included, '**', $.included, 'with', $.list_inst),
      seq($.list_included, '**', $.mod_content),
      $.list_included,
      seq($.included, 'with', $.list_inst, '**', $.mod_content),
      seq($.included, 'with', $.list_inst),
      seq($.mod_content),
      seq($.mod_body, ';')
    ),

    mod_content: $ => seq(optional(seq('open', $.list_open, 'in')), '{', optional($.list_top_def), '}'),

    list_top_def: $ => seq($._top_def, optional($.list_top_def)),

    list_open: $ => seq($._open, optional(seq(',', $.list_open))),

    _open: $ => choice(
      $.o_simple,
      $.o_qualif
    ),
    o_simple: $ => $.module_name,
    o_qualif: $ => seq('(', $.module_name, '=', $.module_name, ')'),

    list_inst: $ => seq($.inst, optional(seq(',', $.list_inst))),

    inst: $ => seq('(', $.module_name, '=', $.module_name, ')'),

    list_included: $ => seq($.included, optional(seq(',', $.list_included))),

    included: $ => seq($.module_name, optional($._module_included)),

    _module_included: $ => choice(
      $.mi_only,
      $.mi_except
    ),
    mi_only: $ => seq('[', $.list_ident, ']'),
    mi_except: $ => seq('-', '[', $.list_ident, ']'),

    _top_def: $ => choice(
      seq('cat', $.list_cat_def),
      seq('fun', $.list_fun_def),
      seq('def', $.list_def_def),
      seq('data', $.list_data_def),
      seq('param', $.list_param_def),
      seq('oper', $.list_oper_def),
      seq('lincat', $.list_term_def),
      seq('lindef', $.list_term_def),
      seq('linref', $.list_term_def),
      seq('lin', $.list_lin_def),
      seq('printname', 'cat', $.list_term_def),
      seq('printname', 'fun', $.list_term_def),
      seq('flags', $.list_flag_def),
    ),

    cat_def: $ => choice(
      seq($.ident, optional($.list_d_decl)),
      seq('[', $.ident, optional($.list_d_decl), ']'),
      seq('[', $.ident, optional($.list_d_decl), ']', '{', $.integer, '}'),
    ),

    fun_def: $ => seq($.list_ident, ':', $._exp),

    def_def: $ => seq($.lhs_name, optional($.list_patt), '=', $._exp),

    data_def: $ => choice(
      seq($.ident, '=', $.list_data_constr),
      seq($.list_ident, ':', $._exp)
    ),

    param_def: $ => seq($.lhs_ident, optional(seq('=', $.list_par_constr))),

    oper_def: $ => choice(
      seq($.lhs_names, ':', $._exp),
      seq($.lhs_names, '=', $._exp),
      seq($.lhs_name, $.list_arg, '=', $._exp),
      seq($.lhs_names, ':', $._exp, '=', $._exp)
    ),

    lin_def: $ => choice(
      seq($.lhs_names, '=', $._exp),
      seq($.lhs_name, $.list_arg, '=', $._exp)
    ),

    term_def: $ => seq($.lhs_names, '=', $._exp),

    flag_def: $ => seq($.ident, '=', choice($.ident, $.double)),

    list_data_constr: $ => seq($.ident, optional(seq('|', $.list_data_constr))),

    par_constr: $ => seq($.ident, optional($.list_d_decl)),

    list_lin_def: $ => seq($.lin_def, ';', optional($.list_lin_def)),

    list_def_def: $ => seq($.def_def, ';', optional($.list_def_def)),

    list_oper_def: $ => seq($.oper_def, ';', optional($.list_oper_def)),

    list_cat_def: $ => seq($.cat_def, ';', optional($.list_cat_def)),

    list_fun_def: $ => seq($.fun_def, ';', optional($.list_fun_def)),

    list_data_def: $ => seq($.data_def, ';', optional($.list_data_def)),

    list_param_def: $ => seq($.param_def, ';', optional($.list_param_def)),

    list_term_def: $ => seq($.term_def, ';', optional($.list_term_def)),

    list_flag_def: $ => seq($.flag_def, ';', optional($.list_flag_def)),

    list_par_constr: $ => seq($.par_constr, optional(seq('|', $.list_par_constr))),

    list_ident: $ => seq($.ident, optional(seq(',', $.list_ident))),

    list_ident2: $ => seq($.ident, optional($.list_ident2)),

    lhs_ident: $ => choice(
      $.ident,
      seq($.sort)
    ),

    lhs_name: $ => choice(
      $.lhs_ident,
      seq('[', $.lhs_ident, ']')
    ),

    lhs_names: $ => seq($.lhs_name, optional(seq(',', $.lhs_names))),

    loc_def: $ => choice(
      seq(field('name', $.list_ident), ':', field('type', $._exp)),
      seq(field('name', $.list_ident), '=', field('value', $._exp)),
      seq(field('name', $.list_ident), ':', field('type', $._exp), '=', field('value', $._exp))
    ),

    list_loc_def: $ => seq($.loc_def, optional(seq(';', optional($.list_loc_def)))),

    _exp: $ => choice(
      $.term_fv,
      $.term_abs,
      $.term_c_table,
      $.term_prod,
      $.term_table,
      $.term_let,
      $.term_example,
      $._exp1
    ),
    term_fv: $ => choice(
      seq($._exp1, '|', $._exp),
      seq('variants', '{', optional($.list_exp), '}')
    ),
    term_abs: $ => seq('\\', $.list_bind, '->', $._exp),
    term_c_table: $ => seq('\\\\', $.list_bind, '=>', $._exp),
    term_prod: $ => seq($.decl, '->', $._exp),
    term_table: $ => seq($._exp3, '=>', $._exp),
    term_let: $ => choice(
      seq('let', '{', optional($.list_loc_def), '}', 'in', $._exp),
      seq('let', optional($.list_loc_def), 'in', $._exp),
      seq($._exp3, 'where', '{', optional($.list_loc_def), '}')
    ),
    term_example: $ => seq('in', $._exp5, $.string),

    _exp1: $ => choice(
      $.term_c,
      $._exp2
    ), 
    term_c: $ => seq($._exp2, '++', $._exp1),

    _exp2: $ => choice(
      $.term_glue,
      $._exp3
    ), 
    term_glue: $ => seq($._exp3, '+', $._exp2),

    _exp3: $ => choice(
      $.term_s,
      $.term_t,
      $.term_v,
      $.term_rec_type,
      $._exp4
    ),
    term_s: $ => choice(
      seq($._exp3, '!', $._exp4),
      seq('case', $._exp, 'of', '{', $.list_case, '}'), // this may not be quite right
    ),
    term_t: $ => choice(
      seq('table', alias('', $.t_info_t_raw), '{', $.list_case, '}'),
      seq('table', alias($._exp6, $.t_info_t_typed), '{', $.list_case, '}'),
      seq($._exp3, '**', alias('', $.t_info_t_raw), '{', $.list_case, '}') // careful where you put those empty aliases; sometimes everything breaks
    ),
    term_v: $ => seq('table', $._exp6, '[', optional($.list_exp), ']'),
    term_rec_type: $ => seq($._exp3, '*', $._exp4),
    term_ext_r: $ => seq($._exp3, '**', $._exp4),

    _exp4: $ => choice(
      $.term_app,
      $.term_alts,
      $.term_strs,
      $.term_e_patt,
      $.term_e_patt_type,
      $.term_e_lincat,
      $.term_e_lin,
      $._exp5
    ),
    term_app: $ => choice(
      seq($._exp4, $._exp5),
      seq($._exp4, '{', alias($._exp, $.term_impl_arg), '}'),
      seq('[', $.ident, optional($.exps), ']')
    ),
    term_alts: $ => choice(
      seq('pre', '{', $.list_case, '}'),
      seq('pre', '{', seq(alias($.string, $.term_k), ';', $.list_altern), '}'),
      seq('pre', '{', seq(alias($.ident, $.term_vr), ';', $.list_altern), '}'),
    ),
    term_strs: $ => seq('strs', '{', optional($.list_exp), '}'),
    term_e_patt: $ => seq('#', $._patt3),
    term_e_patt_type: $ => seq('pattern', $._exp5),
    term_e_lincat: $ => seq('lincat', $.ident, $._exp5),
    term_e_lin: $ => seq('lin', $.ident, $._exp5),

    _exp5: $ => choice(
      $.term_p,
      $._exp6
    ),
    term_p: $ => seq($._exp5, '.', $.label),

    _exp6: $ => choice(
      alias($.ident, $.term_vr),
      alias($.sort, $.term_sort),
      alias($.string, $.term_k),
      alias($.integer, $.term_e_int),
      alias($.double, $.term_e_float),
      alias('?', $.term_meta),
      $.term_empty,
      // $.term_app,
      seq('[', alias($.string, $.term_k), ']'),
      seq('{', optional(alias($.list_loc_def, $.term_r)), '}'),
      seq('<', optional(alias($.list_tuple_comp, $.term_r)), '>'),
      seq('(', alias($._exp, $.term_typed), ')')
    ),
    term_empty: $ => seq('[', ']'),
    term_typed: $ => seq('<', $._exp, ':', $._exp, '>'),

    list_exp: $ => seq($._exp, optional(seq(';', optional($.list_exp)))),

    exps: $ => seq($._exp6, optional($.exps)),

    patt: $ => choice($.p_alt, $.p_seq, $._patt1),
    p_alt: $ => seq($.patt, '|', $._patt1),
    p_seq: $ => seq($.patt, '+', $._patt1),

    _patt1: $ => choice(
      seq($.ident, $.list_patt),
      seq($.module_name, '.', $.ident, $.list_patt),
      seq($._patt3, '*'),
      $._patt2
    ),

    _patt2: $ => choice(
      seq($.ident, '@', $._patt3),
      seq('-', $._patt3),
      seq('~', $._exp6),
      $._patt3
    ),

    _patt3: $ => choice(
      '?',
      seq('[', $.string, ']'),
      seq('#', $.ident),
      seq('#', $.module_name, '.', $.ident),
      '_',
      $.ident,
      seq($.module_name, '.', $.ident),
      $.integer,
      $.double,
      $.string,
      seq('{', optional($.list_patt_ass), '}'),
      seq('<', optional($.list_patt_tuple_comp), '>'),
      seq('(', $.patt, ')')
    ),

    patt_ass: $ => seq($.list_ident, '=', $.patt),

    label: $ => choice(
      $.ident,
      seq('$', $.integer)
    ),

    sort: _ => choice('Type', 'PType', 'Tok', 'Str', 'Strs'),

    list_patt_ass: $ => seq($.patt_ass, optional(seq(';', optional($.list_patt_ass)))),

    list_patt: $ => seq($.patt_arg, optional($.list_patt)),

    patt_arg: $ => choice(
      $._patt2,
      seq('{', $.patt, '}')
    ),

    arg: $ => choice(
      $.ident,
      '_',
      seq('{', $.list_ident2, '}')
    ),

    list_arg: $ => seq($.arg, optional($.list_arg)),

    bind: $ => choice(
      $.ident,
      '_',
      seq('{', $.list_ident, '}')
    ),

    list_bind: $ => seq($.bind, optional(seq(',', $.list_bind))),

    decl: $ => choice(
      seq('(', $.list_bind, ':', $._exp, ')'),
      $._exp3
    ),

    list_tuple_comp: $ => seq($._exp, optional(seq(',', optional($.list_tuple_comp)))),

    list_patt_tuple_comp: $ => seq($.patt, optional(seq(',', optional($.list_patt_tuple_comp)))),
    
    case: $ => seq($.patt, '=>', $._exp),

    list_case: $ => seq($.case, optional(seq(';', $.list_case))),

    altern: $ => seq($._exp, '/', $._exp),

    list_altern: $ => seq($.altern, optional(seq(';', $.list_altern))),

    d_decl: $ => choice(
      seq('(', $.list_bind, ':', $._exp, ')'),
      $._exp6
    ),

    list_d_decl: $ => seq($.d_decl, optional($.list_d_decl)),

    list_cf_rule: $ => seq($.cf_rule, optional($.list_cf_rule)),
    
    cf_rule: $ => choice(
      seq($.ident, '.', $.ident, '::=', optional($.list_cf_symbol), ';'),
      seq($.ident, '::=', $.list_cfrhs, ';'),
      seq('coercions', $.ident, $.integer, ';'),
      seq('terminator', optional($.non_empty), $.ident, $.string, ';'),
      seq('separator', optional($.non_empty), $.ident, $.string, ';')
    ),

    list_cfrhs: $ => seq($.list_cfrhs, optional(seq('|', $.list_cfrhs))),

    list_cf_symbol: $ => seq($.cf_symbol, optional($.list_cf_symbol)),

    cf_symbol: $ => choice(
      $.string,
      $.ident,
      seq('[', $.ident, ']')
    ),

    non_empty: _ => 'nonempty',

    list_ebnf_rule: $ => seq($.ebnf_rule, optional($.list_ebnf_rule)),

    ebnf_rule: $ => seq($.ident, '::=', $.erhs0, ';'),

    erhs0: $ => seq($.erhs1, optional(seq('|', $.erhs0))),

    erhs1: $ => seq($.erhs2, optional($.erhs1)),

    erhs2: $ => seq($.erhs3, optional(choice('*', '+', '?'))),

    erhs3: $ => choice(
      $.string,
      $.ident,
      seq('(', $.erhs0, ')')
    ),

    module_name: $ => choice(
      $.ident
    ),

    ...basic,


  }
  // rules: {
  //   program: $ => repeat(choice(
  //     $.mod_type
  //   )),
  //
  //   ident: _ => /[a-z]+/,
  //
  //     
  //   mod_header: $ => choice($.complMod, '=', $.mod_header_body),
  //
  //   compl_mod: _ => optional('incomplete'),
  //
  //   mod_type: $ => choice(
  //     choice('abstract', $.module_name),
  //     choice('resource', $.module_name),
  //     choice('interface', $.module_name),
  //     choice('concrete', $.module_name, 'of', $.module_name),
  //     choice('instance', $.module_name, 'of', $.module_name),
  //   ),
  //
  //   mod_header_body: $ => choice(
  //     choice($.list_included, '**', $.included, 'with' $.list_inst, '**', $.mod_open)
  //   ),
  //
  //   module_name: $ => $.ident,
  //
  // }
});
