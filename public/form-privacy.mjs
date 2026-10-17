const escapeText=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function safePrivacyUrl(value){
  if(typeof value!=='string'||value.length>2000||!/^https:\/\/[A-Za-z0-9.-]+(?::[0-9]{1,5})?(?:[/?#][^\s]*)?$/.test(value)||/[<>"\\]/.test(value))return '';
  try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password?u.href:''}catch{return ''}
}
export function renderPrivacyNotice(notice,organization){
  if(!notice||typeof notice.notice_text!=='string')return `<section class="organization-privacy legacy-privacy"><strong>Dane dla ${escapeText(organization||'organizatora wydarzenia')}</strong><p>Ten wcześniej utworzony link nie zawiera zapisanej informacji RODO organizatora. Jeśli nie otrzymałeś jej inną drogą, poproś organizatora o przekazanie informacji przed wysłaniem danych.</p></section>`;
  const url=safePrivacyUrl(notice.information_url);
  return `<section class="organization-privacy"><strong>Administrator danych: ${escapeText(notice.controller_name)}</strong><p>Kontakt w sprawach danych: ${escapeText(notice.contact_email)}</p><details><summary>Jak firma przetwarza Twoje dane</summary><div class="privacy-notice-text">${escapeText(notice.notice_text)}</div>${url?`<p><a href="${escapeText(url)}" target="_blank" rel="noopener noreferrer">Polityka prywatności firmy (nowa karta)</a></p>`:''}</details><small>Przydaś udostępnia formularz i przetwarza dane na zlecenie organizatora.</small></section>`;
}
