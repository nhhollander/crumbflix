import './style.scss';

function require_all(r:any) {
    r.keys().forEach(r);
}
require_all(require.context('./components/', true, /\.ts$/))
