// Canonical public-form branding. Copies in component repos are derived from this file.
export const LOGO_MAX_BYTES=2097152;
export const LOGO_MIME_TYPES=['image/png','image/jpeg','image/webp'];
const logoUuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
export function logoReadUrl(logo,organizationId=null,now=Date.now()){
 if(!logo||logo.version!==1||!logoUuid.test(logo.id||'')||!logoUuid.test(logo.revision||'')||!LOGO_MIME_TYPES.includes(logo.mimeType)||!Number.isInteger(logo.sizeBytes)||logo.sizeBytes<1||logo.sizeBytes>LOGO_MAX_BYTES||!Number.isInteger(logo.width)||!Number.isInteger(logo.height)||logo.width<1||logo.height<1||logo.width>4096||logo.height>4096||!(Date.parse(logo.expiresAt)>now))return '';
 try{
  const url=new URL(logo.url),match=url.pathname.match(/^\/storage\/v1\/object\/sign\/organizacja-pliki\/([1-9][0-9]*)\/form-logos-v1\/([a-f0-9-]{36})\.(png|jpg|webp)$/i);
  if(url.origin!=='https://jyzajgbgkqlczjpoxxzt.supabase.co'||url.username||url.password||url.hash||!match||!logoUuid.test(match[2])||!url.searchParams.get('token')||(organizationId!==null&&Number(match[1])!==Number(organizationId)))return '';
  if(({png:'image/png',jpg:'image/jpeg',webp:'image/webp'})[match[3].toLowerCase()]!==logo.mimeType)return '';
  return url.href;
 }catch{return ''}
}
export function applyFormBranding(data,doc,resolveUrl=logoReadUrl){
 const image=doc.getElementById('organization-logo'),organization=doc.getElementById('organization-brand'),brand=doc.getElementById('platform-brand'),footer=doc.getElementById('platform-footer');
 if(!image||!organization||!brand||!footer)return;
 const fallback=()=>{organization.hidden=true;brand.hidden=false;footer.hidden=true;image.removeAttribute('src')};
 image.onerror=fallback;
 const url=resolveUrl(data?.organization_logo);
 if(!url){fallback();return}
 image.alt='Logo organizacji '+String(data.organization_name||'');
 image.referrerPolicy='no-referrer';image.src=url;organization.hidden=false;brand.hidden=true;footer.hidden=false;
}
