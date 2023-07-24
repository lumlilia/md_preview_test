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
  }
}


function Convert(txt){
  const lines = txt.split("\n");
  let blocks = Math.floor(lines.filter((el) => el.startsWith('```')).length / 2);
  let block_type = '';
  let ul_num = 0;

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

  txt = SandRep(txt, '```', new RegExp('```.+```', 's'), '"""', '"""');

  let temps = txt.split('"""');
  txt = '';

  for(let i = 0; i < temps.length; i++){
    if(!temps[i]){
      txt += '<br>';
      continue;
    }

    else if(i % 2){
      txt += '<div class="code_block">' + temps[i].replace(/(?!^.*)\n/g, '<br>') + '</div>';
    }

    else{
      temps[i] = temps[i].replace(/\\_/g, '""');
      temps[i] = temps[i].replace(/\\\*/g, "''");

      temps[i] = SandRep(temps[i], '__', /__.+(__)(?!_)/, '<u>', '</u>');
      console.log(temps[i]);
      temps[i] = SandRep(temps[i], '_', /_.+_(?!_)/, '<i>', '</i>');
      console.log(temps[i]);
      temps[i] = SandRep(temps[i], '**', /\*\*.+(\*\*)(?!\*)/, '<b>', '</b>');
      console.log(temps[i]);
      temps[i] = SandRep(temps[i], '*', /\*.+\*(?!\*)/, '<i>', '</i>');

      temps[i] = temps[i].replace(/""/g, '_');
      temps[i] = temps[i].replace(/''/g, "*");

      let lines = temps[i].split("\n");
      let list_layer = [0, 0];
      let bq_flag = false;
      let tag_temp = '';


      for(l of lines){
        let hn = 0;
        let block_flag = false;

        if(bq_flag){
          if(!l.match(/^\s*&gt;\s/)){
            while(list_layer[1]){
              list_layer[1]--;
              tag_temp += '</ul>';
            }

            bq_flag = false;
          }
        }

        if(list_layer[0]){
          if(l.match(/^\s+(\-|\*)\s/)){
            l = l.replace(/^\s+(\-|\*)\s/, ((list_layer[0] != 2) ? '<ul>' : '') + '<li>');
            list_layer[0] = 2;
            block_flag = true;
          }

          else if(list_layer[0] == 2 && l.match(/^(\-|\*)\s/)){
            list_layer[0] = 1;
            l = l.replace(/^(\-|\*)\s/, '</ul><li>');
            block_flag = true;
          }

          else if(!l.match(/^(\-|\*)\s/)){
            while(list_layer[0]){
              list_layer[0]--;
              tag_temp += '</ul>';
            }
          }
        }

        l = l.replace(/^\s*/, '');

        if(l.match(/^#.*\s/)){

          for(str of l){
            if(str == '#'){
              hn++;
            }

            else{
              break;
            }
          }

          block_flag = true;
          l = l.substring(hn + 1);
        }

        if(l.match(/^\\(\-|\*)\s/)){
          l = l.replace("\\-\s", '- ');
          l = l.replace("\\*\s", '* ');
        }

        else if(l.match(/^(\-|\*)\s/)){
          l = (!list_layer[0] ? '<ul>' : '')
            + '<li>' + l.substring(2);
          list_layer[0] = 1;
          block_flag = true;
        }

        if(l.match(/^\\&gt;\s/)){
          l = l.replace('\\&gt;', '&gt;');
        }

        else if(l.match(/^&gt;\s/)){
          block_flag = true;
          l = l.substring(5);

          if(l.match(/^(\-|\*)\s/)){
            l = '<blockquote>'
              + (!list_layer[1] ? '<ul>' : '') + '<li>' + l.substring(l.indexOf(/(\-|\*)/) + 3) + '</li></blockquote>';

            list_layer[1] = 1;
          }

          else{
            l = '<blockquote>' + l + '</blockquote>';
          }

          bq_flag = true;
        }

        txt += tag_temp
          + (hn ? '<h' + hn + '>' : '')
          + l
          + (list_layer[0] ? '</li>' + (hn ? '</ul>' : '') : '')
          + (hn ? '</h' + hn + '>' : '')
          + (block_flag ? '' : '<br>');
      }

      for(ll of list_layer){
        while(ll){
          txt += '</ul>';
          ll--;
        }
      }
    }
  }

  return txt;
}


function SandRep(t, st1, st2, rt1, rt2){
  let pos = -1;
  let s_pos = 0;
  let len = st1.length;

  while(s_pos > pos){
    let ss = t.substring(s_pos).match(st2);
    let ss_len = -1;

    if(ss){
      let ss_len = ss.index + ss[0].length;
      console.log(ss);

      t = t.substring(0, ss_len - len)
        + rt2
        + t.substring(ss_len);
      t = t.substring(0, ss.index)
        + rt1
        + t.substring(ss.index + len);
    }

    else{
      break;
    }
    pos = s_pos;
    s_pos = ss_len;
  }

  return t;
}
