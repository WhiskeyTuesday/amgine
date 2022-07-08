# Amgine, an enigma machine in node
My initial intention was to write an enigma machine implementation which would
  - teach the reader how an enigma machine works assuming they understand js
  - teach the reader some modern js assuming they understand the enigma machine

I'm not sure the current version would really succeed at either of those goals.

The thought was that by using a symbol manipulation approach rather than doing
a lot of int to char conversions and shifting by 65 for ascii and such it would
end up more understandable than the few versions I browsed over before I started
this one, most especially
[Mike Pound's version in Java](https://github.com/mikepound/enigma) the
accompanying [Computerphile video](https://www.youtube.com/watch?v=RzWB5jL5RX0)
of which was the main inspiration for this project and on which I based the
general structure of this version.

In order to get it working I ended up doing a bit of array index numerical
manipulation anyway, which rather subtracts from the pedagogical value, but,
hey, it does work and it's quite compact and I'm relatively happy with it.
I think it does do a decent job of illustrating how closures and scoping can be
used to create a sort of functional object oriented hybrid in js without using
the `class` or `this` keywords.

I may add a more "teachable" version of the encipher function eventually
that does manipulate the symbols more directly, but then it's always hard
to get motivated to reimplement a function that's already working, so I may
never get around to it.

If I take another swing at this it'll probably be to add some of the analysis
methods discussed in the video, maybe some automated testing to ensure I don't
break anything if I get around to adding the possibility of 4 rotor naval
enigma, that sort of thing. I'm also intrigued by the possibility of writing
a simulator of the Lorentz/Tunny cipher machine, of which (though I haven't looked
especially hard) I've not found an open source simulator. I should also add
a reset function that puts the positions back to 0 without changing the rings
or having to initialize another machine probably...

Anyway, here it is, play with it, fiddle with the settings, decode my not very
secret messages. There are more of them in MESSAGES.md

Acknowledgements go out to Mike Pound and Computerphile as mentioned above
and also to the authors of the
[101Computing](https://www.101computing.net/enigma-machine-emulator/), and
[Piotte13](https://piotte13.github.io/enigma-cipher/) enigma simulators, whose
code I did not look at, but which I did use to troubleshoot and verify my own
version.

JFZED HUTMF FNKOE LBURD QYHBE JNMCD DJDWV KZPYJ GSMYW AKRRZ XOBVV NMZKQ WPUBS
SKSMO CRKDG LV
