Pod::Spec.new do |s|
  s.name = 'FinlyShare'
  s.version = '1.0.0'
  s.summary = 'Native share and Downloads helpers for Finly.'
  s.description = 'Small Expo module that exposes the iOS share sheet result and Android Downloads saving.'
  s.author = 'Finly'
  s.homepage = 'https://github.com/Alfonfdez/Finly'
  s.license = { :type => 'MIT' }
  s.platforms = { :ios => '15.1' }
  s.source = { :git => '' }
  s.static_framework = true
  s.swift_version = '5.9'
  s.dependency 'ExpoModulesCore'
  s.source_files = '**/*.{h,m,mm,swift}'
end
