uniform float u_time;
out vec3 color;

float hash21(vec2 p) {
    p = fract(p * vec2(233.34, 851.74)) + dot(p, p + 23.45);
    return fract(p.x * p.y);
}

mat2 rotate(float a) {
    return mat2(cos(a), sin(a), -sin(a), cos(a));
}

void main() {
    color = vec3(0);
    vec2 i_fcoord = gl_FragCoord.xy;
    vec2 i_canvas = vec2(i_X, i_Y);
    vec2 i_aspect = vec2(i_X / i_Y, 1);
    vec3 i_uv = i_fcoord / i_canvas * i_aspect;

    vec2 i_shift = vec2(1. + 2 * cos(u_time / 2), 2 * sin(u_time / 10)) * .5;
    mat2 i_rotation = rotate(u_time / 10);

    vec2 uv = i_uv + i_shift * i_rotation;
    for (int i = 0; i < 5; i++)
    {
        vec2 fbmp = uv;
        float z = fract((i * .2) + u_time * .1);
        float fade = smoothstep(.0, .5, z) * smoothstep(1., .8, z);
        float fbms;
        float fbmm;
        float fbma = .5;
        for (int i = 0; i < 8; i++)
        {
            vec2 noiseu = fract(fbmp) * fract(fbmp) * (3 - 2 * fract(fbmp));
            vec2 i_noisei = ceil(fbmp);
            float i_noisea = hash21(i_noisei);
            float i_noiseb = hash21(i_noisei + vec2(1, 0));
            float i_noisec = hash21(i_noisei + vec2(0, 1));
            float i_noised = hash21(i_noisei + vec2(1, 1));

            fbms += fbma * (mix(mix(i_noisea, i_noiseb, noiseu.x), mix(i_noisec, i_noised, noiseu.x), noiseu.y));
            fbmm += fbma;
            fbma *= .5;
            fbmp *= 2;
        }
        color += ((fbms / fbmm) * .5 * mix(vec3(0, .5, .5), vec3(1, .5, 0), fade));
        vec2 layeruv = (rotate(i * 3.14) * uv * mix(5., .1, z) + i) * 4;
        vec2 i_layeriv = floor(layeruv);
        vec2 layergv = fract(layeruv) - .5;
        vec2 layerr = (sin(vec2(hash21(i_layeriv), hash21(i_layeriv + hash21(i_layeriv))) * 25.) * .3);
        vec3 i_layer0 = mix(vec3(0, 0, 1), vec3(1, .4, 0), mix(0, 1, z));
        vec3 i_layer1 = (1. - smoothstep(.3 * hash21(i_layeriv), .3 * hash21(i_layeriv) + .05, length(layergv - layerr)));
        vec3 i_layer2 = (1. / dot((layerr - layergv) * 25, (layerr - layergv) * 25));
        vec3 i_layer3 = (.7 * hash21(i_layeriv));
        vec3 i_layer4 = mix(.8 * sin(u_time / 5) * vec3(.5, .2, 0), vec3(0), length(.5 + uv / 2));
        color += i_layer0 * i_layer1 * i_layer2 * i_layer3 * fade + i_layer4;
    }
}
