const pv_box = document.getElementById('pv_box');
const ta = document.getElementById('ta');
const pv_cb = document.getElementById('pv_cb');
const pv_btn = document.getElementById('pv_btn');
const rs_btn = document.getElementById('rs_btn');

pv_cb.addEventListener('change', PvModeToggle);
pv_btn.addEventListener('click', OnPvBtn);
rs_btn.addEventListener('click', OnRsBtn);

PvModeToggle();

function PvModeToggle(e){
  if(pv_cb.checked){
    ta.addEventListener('input', PvBoxAutoInput);
    pv_box.innerHTML = Convert(ta.value);
    pv_btn.disabled = true;
  }

  else{
    ta.removeEventListener('input', PvBoxAutoInput);
    pv_btn.disabled = false;
  }
}


function PvBoxAutoInput(e){
  pv_box.innerHTML = Convert(e.target.value);
}


function OnPvBtn(e){
  pv_box.innerHTML = Convert(ta.value);
}


function OnRsBtn(e){
  if(confirm('入力欄をリセットしますか？')){
    ta.value = '';
    pv_box.innerHTML = '';
  }
}


function Convert(txt){
  const lines = txt.split("\n");

  const regs = [
    new RegExp('&', 'g'), '&amp;',
    new RegExp('<', 'g'), '&lt;',
    new RegExp('>', 'g'), '&gt;',
    new RegExp('"', 'g'), '&quot;',
    new RegExp("'", 'g'), '&#39;',
  ];

  for(let i = 0; i < regs.length; i += 2){
    txt = txt.replace(regs[i], regs[i + 1]);
  }

  let ret_txt = '';

  let reg_s = /^```.*$/m;
  let reg_e = /^```$/m;
  const blocks = [];
  let pos = 0;

  while(1){
    let t_ss = txt.substring(pos);
    const m = t_ss.match(reg_s);
    if(m == null){
      blocks.push(t_ss);
      break;
    }


    const m_e = txt.substring(pos + m.index + 3).match(reg_e);
    if(m_e == null){
      blocks.push(t_ss);
      break;
    }

    blocks.push(t_ss.substring(0, m.index), m_e.input.substring(0, m_e.index - 1));
    pos += m.index + m_e.index + 7;
  }


  let blocks_len = blocks.length;

  for(let i = 0; i < blocks_len; i++){
    if(i % 2){
      if(blocks[i][0] != '\n'){
        blocks[i] = blocks[i].replace(/^.*$/m, '<!-- ' + blocks[i].match(/^.*$/m) + ' -->');
      }
      blocks[i] = blocks[i].replace('\n', '');
      ret_txt += '<pre><code>' + blocks[i] + '</code></pre>';
      continue;
    }

    let temp = '';
    let mode = 0;
    for(let line of blocks[i].split('\n')){
      let b_flag = false;
      temp = '';
      if(line == '---'){
        line = '<hr />';
      }

      line = CheckBlock(line, '#', 'h');
      line = CheckBlock(line, '&gt;', '<blockquote>');

      let line_s = CheckMark(line, '`', 'code', 1);
      line = '';
      for(let j = 0; j < line_s.length; j++){
        if(!(j % 2)){
          line_s[j] = CheckMark(line_s[j], '\\*\\*', 'em', 0);
          line_s[j] = CheckMark(line_s[j], '\\*', 'strong', 0);
        }

        line += line_s[j];
      }

      ret_txt += line;
    }
  }

  return ret_txt;
}


function CheckMark(t, s, o, mode){
  let pos = 0;
  const s_len = s.replace(/\\/g, '').length;
  const regs = [
    new RegExp('(?<!\\\\)' + s + '[^' + s + ']+'),
    new RegExp('(?<!(' + s + '|\\\\))' + s)
  ];

  let ret_t = '';
  let ret_a = [];

  while(1){
    let t_ss = t.substring(pos);
    let m = t_ss.match(regs[0]);
    if(m == null){
      if(mode){
        ret_a.push(t_ss);
      }
      else{
        ret_t += t_ss;
      }
      break;
    }

    let m_e = t_ss.substring(m.index + s_len).match(regs[1]);

    if(m_e == null){
      if(mode){
        ret_a.push(t_ss);
      }
      else{
        ret_t += t_ss;
      }
      break;
    }

    let ret1 = t_ss.substring(0, m.index);
    let ret2 = '<' + o + '>'
      + m_e.input.substring(0, m_e.index)
      + '</' + o + '>';

    if(mode){
      ret_a.push(ret1, ret2);
    }

    else{
      ret_t += ret1 + ret2;
    }

    pos += m.index + m_e.index + s_len * 2;
  }

  return (mode ? ret_a : ret_t);
}

function CheckBlock(t, s, o){
  let flag = false;
  let m = t.match(new RegExp('^\\\s*(?<!\\\\)' + s + ((s == '#') ? '+' : '') + '\\\s'));
  if(m != null){
    flag = true;
    let len = ((s == '#') ? m[0].match(/[#]+/)[0].length : 0);
    if(len > 6){
      len = 6;
    }
    if(len){
      o = '<' + o + (len ? len : '') + '>';
    }

    t = t.replace(RegExp('^\\\s*' + s + '+\\\s'), o);
    t += o[0] + '/' + o.substring(1);
  }

  return t;
}
