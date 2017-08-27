/*global Snap, mina, $*/
var width, height;
var backBackHill;
var backHill;
var frontHill;
var trickery;
var sunlight;
var audio;
var toggle;

var texts = [
    "<i>&quot;Not he is great that can alter matter, but he that can alter my state of mind. But they are the kings of the world give who the color of their present thought to all nature & all art, & persuade men by the cheerful serenity of their carrying the matter that this is the apple which ages have inspired to pluck now at last right and inviting nations to the harvest. The great man makes the great thing.&quot;</i><br/>- Ralph Waldo Emerson",
    "What I thought of this quote when I first saw it is exactly what I still think of it now. <br/> Any man can build something, or invent something, or destroy something.<br/><br/> But in Ralph Emerson's eyes, a man only has power when he can <i>trick</i> someone, or deceive them, or change their way of belief.",
    "Personally, I disagree with this aphorism. <br/>A man with the ability to convince people of things they originally did not believe could certainly be able to get his way out of anything. But in my opinion, someone who does that - messing with people's minds to get what they want - does not deserve respect.",
    "However, someone who has the understanding necessary to take advantage of the world around him; to engineer devices and to break the barrier between reality and fiction;<br/> That's a man who deserves my respect.",
    "Whenever I think of &quot;someone who can alter my state of mind,&quot; I think of hypnotists, con artists, liars, and thieves.<br/> Maybe I'm just paranoid, but it seems like the power of deception can easily be abused.",
    "<p>But this depends on the definition of &quot;great.&quot;</p>",
    "I based my opinions on the idea of &quot;great&quot; meaning &quot;good.&quot; Perhaps Emerson intended that a great man simply meant a man with a lot of power.",
    "But still, I believe that a man with the ability to manipulate the world around him has much more power than someone who simply has the power to manipulate people.",
    "Scientists, engineers, innovators, builders.<br> These people can make true change, and these people have more control, and these people are the greater people of the world.",
    "<p>It's just like they say:<br/>Actions speak louder than words.</p>",
    "<div id='small'>The human race never would have accomplished anything significant if it weren't for people like<br/>Da Vinci, the Wright brothers, Einstein, Van Gogh, Galileo, Tesla, Bell, Aristotle, Feynman, Shakespeare, and others.<br/><br/>These men are so great that we learn about most of them in our classes.<br/>In 20 years, will anyone care about the swindler who made off with a bunch of money, or the preacher who got a thousand people to form a cult, or the fantastic, charismatic, successful salesman whose funeral was attended by hundreds of people?</div>",
    "<p>No. Of course not.</p>",
    "This analysis did become simply an argument of my views versus Emerson's views.<br/>But everyone has their opinions, and I wanted to share how mine differ from Emerson's.",
    "To me, a man is only as great as his impact on the world.",
    "But everyone's entitled to their opinions.",
    "My belief is the reason why I went through so much effort to make this interactive webpage.",
    "I wanted to show that I can create something<br/> special and meaningful, to show what I can do<br/> when I put my heart into it.<br/><br/>It's not common when I get to do that.",
    "And maybe, just maybe, this is what Emerson meant.<br/>I was incredibly inspired by the chance to alter <strong>your</strong> minds, to give you my thoughts and to maybe leave an impact on you.",
    "But this is just English class. Who am I to say that my project would impact your lives?",
    "Well, I can hope.",
    "",
    "Thanks for listening.",
    "<i>Designed, Programmed, and Written by Jordan Lees</i><i><br/><br/>Song: &quot;21 Stars&quot; by JNATHYN</i>"
];
var currentText = 0;
mina.superease = function(n) {
    if (n == 1) {
        return 1;
    }
    if (n == 0) {
        return 0;
    }
    var q = .48 - n / 1.04,Q = Math.sqrt(.13 + q * q),x = Q - q,X = Math.pow(Math.abs(x), 1 / 3) * (x < 0 ? -1 : 1),
        y = -Q - q,Y = Math.pow(Math.abs(y), 1 / 3) * (y < 0 ? -1 : 1),t = X + Y + .5;
    return (1 - t) * 3 * t * t + t * t * t;
};
$(function() {
    width = parseInt($(document).width());
    height = parseInt($(document).height());
    var d = width * 0.1;
    sunlight = document.getElementById("sunlight");
    $("#svg").attr({
        width: width,
        height: height
    });
    $("#text").html(texts[0]);
    var s = Snap("#svg");
    backBackHill = s.circle(width * 0.6, height * 6, height * 5.1);
    backHill = s.circle(width * 0.2, height * 2.3, height * 1.4);
    frontHill = s.circle(width * 0.9, height * 2.0, height * 1.2);
    trickery = s.circle(-1500, -1500, 10);
    frontHill.attr({ fill: "#C2BC7A", stroke: "#4F4A35",strokeWidth: 3
    });
    backHill.attr({ fill: "#C9B9BB",stroke: "#52464C", strokeWidth: 3
    });
    backBackHill.attr({ fill: "#E1EBF0", stroke: "#525557", strokeWidth: 3
    });
    animate();
    setInterval(function() { animate(); }, 12000);
    setInterval(function() { modSize(); }, 20);

    function animate() {
        frontHill.animate({cx: width * 0.82
        }, 6000, mina.superease, function() {
            frontHill.animate({cx: width * 0.9}, 6000, mina.superease, function() {});
        });
        backHill.animate({cx: width * 0.15
        }, 6000, mina.superease, function() {
            backHill.animate({cx: width * 0.2}, 6000, mina.superease, function() {});
        });
        backBackHill.animate({cx: width * 0.58
        }, 6000, mina.superease, function() {
            backBackHill.animate({cx: width * 0.6}, 6000, mina.superease, function() {});
        });

        trickery.animate({cx: -1000,cy: -1000
        }, 6000, mina.superease, function() {
            trickery.animate({cx: -1500,cy: -1500}, 6000, mina.superease, function() {});
        });
    }
    function modSize() {
        var mod = -1 * trickery.attr().cx;
        sunlight.style.width = mod;
        sunlight.style.left = 2100 - mod;
        sunlight.style.height = mod;
        //$("#text").css("font-size", 1.3 + 200/mod + "em");
        $("#text").css("transform", "scale(" + (1 + (1500 / mod) / 10) + "," + (1 + (1500 / mod) / 10) + ")");
    }
});

$(window).resize(function() {
    width = parseInt($(document).width());
    height = parseInt($(document).height());
    $("#svg").attr({
        width: width,
        height: height
    });
});
$(document).click(function() {
    click();
});
$(document).keypress(function(evt){
    key(evt);
})
$(window).resize(function() {
    width = parseInt($(document).width());
    height = parseInt($(document).height());
    $("#svg").attr({
        width: width,
        height: height
    });
});

function key(e){
    switch(Number(e.keyCode)){
        case 32:
            //spacesbar
            click();
            break;
        case 112:
            //p
            toggle = toggle ? false : true;
            toggle ? $("#audio")[0].play() : $("#audio")[0].pause();
            break;
        default:
    }
}

function click(){
       currentText++;
    var condition = 0;
    var loop = function() {
        $("#text").css("opacity", (0.7 - condition / 100));
        if (condition++ < 100) {
            setTimeout(loop, 5);
        }
    };
    if (condition++ < 100) {
        loop();
    }
    
    if (currentText >= texts.length) {
        currentText = 0;
        $("#text").html(texts[0]);
    }else {
        $("#text").html(texts[currentText]);
    }
    var i = 0;
    
    var loop2 = function() {
        $("#text").css("opacity", (i / 100));
        if (i++ < 100) {
            setTimeout(loop2, 5);
        }
    };
    if (i++ < 100) {
        loop2();
    }
}