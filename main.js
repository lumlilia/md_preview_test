const pv_box = document.getElementById('pv_box');
const ta = document.getElementById('ta');
const pv_cb = document.getElementById('pv_cb');
const pv_btn = document.getElementById('pv_btn');
const rs_btn = document.getElementById('rs_btn');
const cp_btn = document.getElementById('cp_btn');

pv_cb.addEventListener('change', PvModeToggle);
pv_btn.addEventListener('click', OnPvBtn);
rs_btn.addEventListener('click', OnRsBtn);


function PvModeToggle(e){
  if(e.target.checked){
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
  let return_txt = '';

  const lines = txt.split("\n");
  let blocks = Math.floor(lines.filter((el) => el.startsWith('```')).length / 2);
  let block_type = '';
  let ul_num = 0;

  for(let t of lines){
    if(!t){
      return_txt += '<br>';
      continue;
    }

    t = t.replace('&', '&amp;');
    t = t.replace('<', '&lt;');
    t = t.replace(/>/g, '&gt;');
    t = t.replace('"', '&quot;');
    t = t.replace("'", '&#39;');

    if(block_type == 'list'){
      if(t.match(/^(\-|\*)\s/)){
        if(ul_num == 2){
          return_txt += '</ul>';
          ul_num = 1;
        }

        return_txt += '<li>' + t.substr(2) + '</li>';
      }

      else if(t.match(/^\s+(\-|\*)\s/)){
        if(ul_num == 1){
          return_txt += '<ul>';
          ul_num = 2;
        }

        return_txt += '<li>' + t.replace(/^(\s)+(\-|\*)\s/, '') + '</li>';
      }

      else{
        while(ul_num){
          return_txt += '</ul>';
          ul_num--;
        }

        block_type = '';
      }
    }

    if(!block_type){
      if(t.startsWith('```') && blocks){
        block_type = 'code';
        blocks--;
        return_txt += '<div class="code_block">';
      }

      else if(t.match(/^#.*\s/)){
        let n = 0;

        for(str of t){
          if(str == '#'){
            n++;
          }

          else{
            break;
          }
        }

        return_txt += '<h' + n + '>' + t.substr(n + 1) + '</h' + n + '>';
      }

      else if(t.match(/^\&gt;\s/)){
        return_txt += '<blockquote>' + t.substr(5) + '</blockquote>';
      }

      else if(t.match(/^(\-|\*)\s/)){
        block_type = 'list';
        ul_num = 1;
        return_txt += '<ul><li>' + t.substr(2) + '</li>';
      }

      else{
        return_txt += '<p>' + t + '</p>';
      }
    }

    else if(block_type == 'code'){
      if(t == '```'){
        block_type = '';
        return_txt += '</div>';
      }

      else{
        return_txt += '<p>' + t + '</p>';
      }
    }
  }

  const block_list = {
    'list': 'ul',
    'code': 'div'
  };

  if(block_type){
    return_txt += '</' + block_list[block_type] + '>';

    if(ul_num == 2){
      return_txt += '</ul>';
    }
  }

  return return_txt;
}
