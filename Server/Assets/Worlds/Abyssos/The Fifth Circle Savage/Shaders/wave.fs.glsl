
varying lowp vec2 vUvCoord;

void main(void) {

}

// Shadertoy Prototype:
// void mainImage( out vec4 fragColor, in vec2 fragCoord )
// {
//     // Normalized pixel coordinates (from 0 to 1)
//     vec2 uv = fragCoord/iResolution.xy;
 

//     // Time varying pixel color
//     vec3 col = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0,2,4));
    
//     float dist = length(vec2(uv.x, (uv.y - 0.5) * 2.0));

//     float verticalScaler = dist * 0.8;
//     uv.x += smoothstep(0.0, 1.0, verticalScaler) * 0.3;
    
//     float sineAmpBooster = 0.8 + 1.0 * sin((uv.x * 50.0 - iTime * 2.0 + iTime * 0.1) / 5.0 ) * 0.5 + 0.5;
    
//     float sineOne = (sqrt(uv.x)*sineAmpBooster*sin(uv.x * 50.0 - iTime * 2.0) * 0.2 + 0.5) ;
//     float sineTwo = (1.0 - uv.x *uv.x * uv.x)*(sqrt(uv.x)*sineAmpBooster*sin(uv.x * 50.0 - iTime * 2.0) * 0.2 + 0.5) + 0.01 * sin(uv.x*10.0 - iTime) + 0.08 ;
    
//     float color = (uv.y > sineOne && uv.y < sineTwo) ? 1.0 : 0.0;

//     // Output to screen
//     fragColor = vec4(color, color, color,1.0);
// }