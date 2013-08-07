var {appendContent}=require("mho:surface");
var {Bootstrap}=require("mho:surface/bootstrap")

document.body .. appendContent(

Bootstrap(`
<div class="header">
<h1>hello world</h1>
<p>hi<p>
</div><!-- end header -->

<div class="row-fluid">
  <div class="span12">
    Fluid 12
    <div class="row-fluid">
      <div class="span6">
        Fluid 6
        <div class="row-fluid">
          <div class="span6">Fluid 6</div>
          <div class="span6">Fluid 6</div>
        </div>
      </div>
      <div class="span6">Fluid 6</div>
    </div>
  </div>
</div>





`)
)