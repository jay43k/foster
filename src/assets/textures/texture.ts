/// <reference path="./fosterWebGLTexture.ts"/>
class Texture
{
	public bounds:Rectangle = null;
	public frame:Rectangle = null;
	public texture:FosterWebGLTexture = null;
	
	public get width():number { return this.frame.width; }
	public get height():number { return this.frame.height; }
	public get clippedWidth():number { return this.bounds.width; }
	public get clippedHeight():number { return this.bounds.height; }

	public constructor(texture:FosterWebGLTexture, bounds?:Rectangle, frame?:Rectangle)
	{
		this.texture = texture;
		this.bounds = bounds || new Rectangle(0, 0, texture.width, texture.height);
		this.frame = frame || new Rectangle(0, 0, this.bounds.width, this.bounds.height);
	}

	public getSubtexture(clip:Rectangle, sub?:Texture):Texture
	{
		if (sub == undefined)
			sub = new Texture(this.texture);
		else
			sub.texture = this.texture;
		
		sub.bounds.x = this.bounds.x + Math.max(0, Math.min(this.bounds.width, clip.x + this.frame.x));
		sub.bounds.y = this.bounds.y + Math.max(0, Math.min(this.bounds.height, clip.y + this.frame.y));
		sub.bounds.width = Math.max(0, this.bounds.x + Math.min(this.bounds.width, clip.x + this.frame.x + clip.width) - sub.bounds.x);
		sub.bounds.height = Math.max(0, this.bounds.y + Math.min(this.bounds.height, clip.y + this.frame.y + clip.height) - sub.bounds.y);

		sub.frame.x = Math.min(0, this.frame.x + clip.x);
		sub.frame.y = Math.min(0, this.frame.y + clip.y);
		sub.frame.width = clip.width;
		sub.frame.height = clip.height;

		return sub;
	}

	public clone():Texture
	{
		return new Texture(this.texture, this.bounds.clone(), this.frame.clone());
	}
	
	public toString():string
	{
		return (this.texture.path + 
		": [" + this.bounds.x + ", " + this.bounds.y + ", " + this.bounds.width + ", " + this.bounds.height + "]" + 
		"frame["+ this.frame.x + ", " + this.frame.y + ", " + this.frame.width + ", " + this.frame.height +"]");
	}

	public dispose():void
	{
		this.texture.dispose();
		this.texture = null;
	}

	public static create(image:HTMLImageElement):Texture
	{
		let gl = Engine.graphics.gl;
		let tex = gl.createTexture();
			
		gl.bindTexture(gl.TEXTURE_2D, tex);
		gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.bindTexture(gl.TEXTURE_2D, null);

		return new Texture(new FosterWebGLTexture(tex, image.width, image.height));
	}
}