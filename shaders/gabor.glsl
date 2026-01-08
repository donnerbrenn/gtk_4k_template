#define DO_ANIMATE 1

const uint splats[] = uint[](
        0x897cffa0u, 0x997dfdd7u, 0x00c8e7f0u, 0xc207be00u, 0x5f839921u, 0x2e58b61eu, 0x9f7ffdfbu, 0x276165c0u,
        0x4497eaceu, 0x887ffe9eu, 0xb0a6b961u, 0x5660fecau, 0xa6b9be0eu, 0x95e7a2fcu, 0xa65599edu, 0x1f73adcfu,
        0x2727bea9u, 0x5c72b1b0u, 0x44fa81d0u, 0xcb58e62bu, 0x552f8640u, 0x2b748d7fu, 0xdb7ad260u, 0xd7518dcdu,
        0x008efe1cu, 0xe98a996au, 0xdd72ae17u, 0x9b5089abu, 0x7f8bb18fu, 0xffd6ae04u, 0xb66a8d1au, 0xb267a59au,
        0x987a61deu, 0xb35a556fu, 0xbcbb59ceu, 0x903d3900u, 0x2a34792cu, 0x73722c81u, 0x42c779b9u, 0xafd56598u,
        0x473279f0u, 0x898b64e9u, 0x3cdc696bu, 0x4f5948efu, 0x3495597fu, 0x5b8e447fu, 0xb30c85a0u, 0x07a5ce17u,
        0x5854591fu, 0xa29ea998u, 0xb6ff6510u, 0x3f4c58c1u, 0x918fb560u, 0x4f9f408du, 0x324c6949u, 0xb4d520a9u,
        0x99846d7fu, 0x3d0971b0u, 0xb131697bu, 0x548b002du, 0x616a8daeu, 0x4f8f9d4du, 0x20179978u, 0x1ac4755du,
        0x51a475edu, 0xc2c55cd5u, 0x4b057150u, 0x4e5d605bu, 0x8b7aa8edu, 0x55d15d20u, 0x8cb32cc1u, 0x4781040bu,
        0x528288bfu, 0xf761958eu, 0x523450ddu, 0x4ee27963u, 0x95b04d0au, 0x97b760d5u, 0x39195d50u, 0x54427530u,
        0x4858719du, 0x352b595bu, 0xcb5a99adu, 0x686d798fu, 0x5fde6910u, 0xb31d4c95u, 0x7b587521u, 0x5fdd48cdu,
        0xdc7ec586u, 0x4e3b3cfeu, 0x2a84a213u, 0x402550b5u, 0x8939512du, 0x55c364cdu, 0x4f4a5081u, 0x6b557505u,
        0x3d224509u, 0x427689ccu, 0x046079a3u, 0x9a945530u, 0x009a91c4u, 0x5b394cdfu, 0x31a54d17u, 0xa620413cu,
        0xc13e50c1u, 0x65e96dddu, 0x455338aau, 0xae4244fcu, 0xdabe814cu, 0xe3c38944u, 0x4a8f3c8au, 0x2c5c80fcu,
        0x6a6c5486u, 0x47605d04u, 0xb50834b7u, 0x4d6f2086u, 0x05b56d05u, 0xa62399bdu, 0x5a68148du, 0x5769752eu,
        0x0f7e8cc2u, 0x4c1430b8u, 0x536e953cu, 0x505f28ddu, 0x916844b4u, 0x8d6c4891u, 0x65e734f3u, 0xaecc34a6u,
        0x000f3228u, 0x2a53a8fbu, 0x2cc2359fu, 0x02a5d733u, 0x33811b54u, 0x27410e40u, 0x13e2ccbcu, 0x2cb63798u,
        0x17990f8au, 0x2e1bcb85u, 0x0e6ab2a3u, 0x102bcf83u, 0x273584c2u, 0x2d333cd4u, 0x27aaf134u, 0x0b43a34bu,
        0x10c66b2du, 0x2d35f966u, 0x37fc0cd4u, 0x33e424c6u, 0x087a62aau, 0x30a572bau, 0x08cb813du, 0x2cbb7927u,
        0x0bcdcc8au, 0x2f1c326fu, 0x35d53151u, 0x3a2b3c7eu, 0x399b8d4du, 0x0c56bb45u, 0x198b2f96u, 0x26954720u,
        0x26fe1272u, 0x13b91b88u, 0x2d9e0a5eu, 0x0e4b5f6du, 0x2bacd334u, 0x2e8a145bu, 0x2d0cdef7u, 0x19dc930au,
        0x193d0242u, 0x0e1b5ad6u, 0x000bd276u);

float decodeImage(vec2 uv)
{
    const vec2 s_min = log2(vec2(0.003337, 0.002319));
    const vec2 s_mag = log2(vec2(1., 0.410247)) - s_min;
    float f = 1.;

    for (int i = 0; i < 128; i++)
    {
        // 42.7 bits per splat, 16 bytes per 3 splats
        uint d0 = splats[i];
        uint d1 = splats[128 + i / 3] >> (10 * (i % 3));

        // 9 + 8 bit position.xy
        vec2 p = vec2(d1 & 511u, d0 >> 24) / vec2(512, 256);

        // 8 bit angle
        float a = float((d0 >> 16) & 255u) * 3.14159 / 256.;

        // 5 bit luma in Gamma 4.0 space
        float y = pow(float((d0 & 15u) | ((d1 >> 5) & 16u)) / 31.5, 4.);

        // 6 + 6 bit size.xy in log2 space
        vec2 s = exp2(s_min + s_mag * vec2((d0 >> 10) & 63u, (d0 >> 4) & 63u) / 63.);

        vec2 c = vec2(cos(a), sin(a));
        vec2 r = mat2x2(c.x, -c.y, c.y, c.x) * (uv - p) / s;

        // Slightly sharper gaussian
        float g = exp2(-0.72135 * exp2(1.5 * log2(r.x * r.x + r.y * r.y)));

        #if DO_ANIMATE
        // Handle appearing at the start of filter
        g *= smoothstep(float(i), float(i) + 0.5, iTime * 32.);
        #endif
        // Alpha blend in linear space
        f = mix(f, y, g);
    }

    // Return in Gamma 2.0
    return sqrt(f);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    // Fit vertically on the inside and adjust aspect ratio
    vec2 uv = fragCoord.xy / iResolution.xy;
    uv = 0.5 + (uv - 0.5) * vec2(0.60694 * iResolution.x / iResolution.y, -1.);

    float img = decodeImage(uv);

    // Darken the wall on the right like in the original shader
    img *= 0.95 * (clamp(3. - uv.x * 2.2, 0., 1.) * 0.4 + 0.6);

    // Don't add speckles in preview!
    if (iResolution.y >= 200.0)
    {
        // Borrowed Dave Hoskins' hash from https://www.shadertoy.com/view/4djSRW
        uv = fract(uv * vec2(443.8975, 397.2973));
        uv += dot(uv.xy, uv.yx + 19.19);
        float k = fract(uv.x * uv.y) * 2. - 1.;

        img = (img + 0.06 * k) * (1. - 0.02 * k);
    }

    fragColor = vec4(img, img, img, 1.);
}
